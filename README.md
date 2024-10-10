### 1️⃣ 방명록 조회

#### ➡️ Request

> METHOD `GET` <br/>
> PATH `/guestbook` <br/>
> QUERY `last_uuid=UUID&take=10`

#### ⬅️ Response

**200 성공**

```json
{
    "items": [
        // ...
        {
            "id": "12345678-abcd-1234-5678-123456789101",
            "to": "보내는사람",
            "from": "받는사람",
            "content": "내용",
            "createdAt": "생성날짜"
        }
    ],
    "last_uuid": "12345678-abcd-1234-5678-123456789101"
}
```

### 2️⃣ 방명록 추가

#### ➡️ Request

> METHOD `POST` <br/>
> PATH `/guestbook` <br/>
> BODY

```json
{
    "to": "Alice",
    "from": "Bob",
    "content": "멋진 행사였어요!"
}
```

#### ⬅️ Response

**201 성공**

```json
{
    "id": "12345678-abcd-1234-5678-123456789101",
    "to": "보내는사람",
    "from": "받는사람",
    "content": "내용",
    "createdAt": "생성날짜"
}
```
