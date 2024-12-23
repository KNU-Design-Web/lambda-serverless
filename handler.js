const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuidv4 } = require("uuid");

const app = express();

const GUESTBOOK_TABLE = process.env.GUESTBOOK_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

app.get("/guestbook", async (req, res) => {
    const take = parseInt(req.query.take, 10) || 10;
    const lastEvaluatedSK = req.query.lastEvaluatedSK;

    const params = {
        TableName: GUESTBOOK_TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": "Guestbook",
        },
        Limit: take,
        ScanIndexForward: false, // 최신순 정렬
    };

    if (lastEvaluatedSK) {
        params.ExclusiveStartKey = {
            PK: "Guestbook",
            SK: lastEvaluatedSK,
        };
    }

    try {
        const command = new QueryCommand(params);
        const data = await docClient.send(command);
        res.json({
            items: data.Items,
            lastEvaluatedSK: data.LastEvaluatedKey ? data.LastEvaluatedKey.SK : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "방명록 조회 오류 발생" });
    }
});

app.post("/guestbook", async (req, res) => {
    const { to, from, content } = req.body;

    if (typeof to !== "string") return res.status(400).json({ error: '"to" 필드는 string 이어야 합니다' });
    if (typeof from !== "string") return res.status(400).json({ error: '"from" 필드는 string 이어야 합니다' });
    if (typeof content !== "string") return res.status(400).json({ error: '"content" 필드는 string 이어야 합니다' });

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const SK = `${createdAt}#${id}`;

    const params = {
        TableName: GUESTBOOK_TABLE,
        Item: {
            PK: "Guestbook",
            SK,
            id,
            to,
            from,
            content,
            createdAt,
        },
    };

    try {
        const command = new PutCommand(params);
        await docClient.send(command);
        res.status(201).json({ id, to, from, content, createdAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "방명록 추가 오류 발생" });
    }
});

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
});

app.use((req, res, next) => {
    if (req.method === "OPTIONS") return res.status(200);

    return res.status(404).json({
        error: "Not Found",
    });
});

exports.handler = serverless(app);
