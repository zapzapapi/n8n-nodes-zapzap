# n8n-nodes-zapzap

Community node para integrar o **WhatsApp** ao n8n através da **[ZapZap API](https://zapzapapi.com)**, envie mensagens, mídia, enquetes/botões/listas, reaja a mensagens, gerencie instâncias e receba eventos em tempo real.

> _Community node to connect **WhatsApp** to n8n via the **ZapZap API**: send messages, media, interactive menus, reactions, manage instances and receive real-time events._

[![npm](https://img.shields.io/npm/v/n8n-nodes-zapzap.svg)](https://www.npmjs.com/package/n8n-nodes-zapzap)

---

## 🇧🇷 Português

### Instalação

No n8n (self-hosted), vá em **Settings → Community Nodes → Install** e informe:

```
n8n-nodes-zapzap
```

Confirme o aviso de risco de community nodes e aguarde a instalação. Os nodes **ZapZap** e **ZapZap Trigger** aparecem no painel de nodes ao buscar por "WhatsApp" ou "ZapZap".

> Requer n8n self-hosted (owner). Em n8n Cloud, a instalação depende da liberação de verified community nodes.

### Credenciais

1. Pegue sua **API Key** e **API Secret** no painel em **[app.zapzapapi.com](https://app.zapzapapi.com) → Configurações**.
2. No n8n, crie uma credencial **ZapZap API**:
   - **API Key** → header `x-api-key`
   - **API Secret** → header `x-api-secret`
   - **Base URL** → `https://api.zapzapapi.com/api/v1` (só mude em self-hosted da ZapZap)
3. Clique em **Test**, o node chama `GET /account` e confirma o acesso mostrando seu saldo.

### Node de ação: ZapZap

**Resource: Message**

| Operação | Endpoint | Campos principais |
|---|---|---|
| Send Text | `POST /{instanceId}/send/text` | Number, Text (+ mentions, reply, delay) |
| Send Media | `POST /{instanceId}/send/media` | Number, Media Type, File URL (+ caption, docName, mentions) |
| Send Interactive | `POST /{instanceId}/send/{poll\|buttons\|list}` | Number, Text, Choices/Buttons (JSON) |
| React | `POST /{instanceId}/message/react` | Number, Message ID (`OWNER:MSGID`), Emoji |

**Resource: Instance**

| Operação | Endpoint |
|---|---|
| Create | `POST /instances` (Name + metadata) |
| Get Status | `GET /{instanceId}/instance/status` |
| Get QR Code | `GET /instances/{instanceId}/qrcode` |
| List | `GET /instances` |

**Formato do número:** DDI + DDD + número, só dígitos, ex. `5511999999999`. Para grupos, use o ID do grupo (`...@g.us`).

### Node de gatilho: ZapZap Trigger

A ZapZap faz o *forward* dos eventos do WhatsApp (webhook da UazAPI) para a URL de webhook da sua instância. O **ZapZap Trigger** expõe essa URL dentro do n8n.

**Como apontar o webhook da instância para o trigger:**

1. Adicione o node **ZapZap Trigger** ao fluxo e **ative o workflow** (a Production URL só funciona com o workflow ativo).
2. Copie a **Production URL** exibida no node (algo como `https://seu-n8n.com/webhook/zapzap-trigger/webhook`).
3. Aponte o webhook da instância para essa URL, de uma destas formas:
   - **Pelo painel:** app.zapzapapi.com → sua instância → Webhook → cole a URL.
   - **Pela API:** `PUT https://api.zapzapapi.com/api/v1/instances/{id}/webhook` com body `{ "webhook_url": "<Production URL>" }` e headers `x-api-key` / `x-api-secret`.
   - **Automático:** ligue **"Registrar Webhook Automaticamente"** no node e informe o **Instance ID**. Ao ativar o workflow, o node registra a URL sozinho (e tenta limpá-la ao desativar).

**Filtro de eventos:** o campo *Events* limita o disparo (messages, connection, messages_update, etc). Vazio = todos. O trigger sempre responde `200` para a ZapZap não desativar o webhook por falhas.

Eventos recebidos trazem `instance_id`, `instance_name`, `metadata` (os dados livres que você gravou na instância), `event` e `data`.

### Exemplo rápido

`ZapZap Trigger` (messages) → `IF` (mensagem contém "oi") → `ZapZap` (Send Text) respondendo ao `number` vindo de `{{$json.data.messages[0].key.remoteJid}}`.

---

## 🇺🇸 English

### Install

In self-hosted n8n: **Settings → Community Nodes → Install** → enter `n8n-nodes-zapzap`, accept the community-node risk notice. The **ZapZap** and **ZapZap Trigger** nodes then appear when searching "WhatsApp" or "ZapZap".

### Credentials

Create a **ZapZap API** credential with your **API Key** / **API Secret** (from [app.zapzapapi.com](https://app.zapzapapi.com) → Settings). Base URL defaults to `https://api.zapzapapi.com/api/v1`. Hit **Test** to validate against `GET /account`.

### Action node (ZapZap)

- **Message**: Send Text, Send Media (image/video/audio/ptt/ptv/document/sticker by URL), Send Interactive (poll/buttons/list), React.
- **Instance**: Create, Get Status, Get QR Code, List.

Phone format: country code + area code + number, digits only (`5511999999999`). Groups use the group JID (`...@g.us`).

### Trigger node (ZapZap Trigger)

ZapZap forwards WhatsApp events to your instance's webhook URL. Add the trigger, activate the workflow, copy its **Production URL**, and point the instance webhook to it, via the ZapZap panel, via `PUT /instances/{id}/webhook`, or by enabling **Auto-Register Webhook** (with the Instance ID) so the node configures it on activation.

---

## Credenciais nunca vão para o cliente final

As chaves `x-api-key` / `x-api-secret` ficam na credencial do n8n (servidor). Nunca as exponha no frontend. (Mesma regra do [tutorial de integração SaaS](https://api.zapzapapi.com/llms.txt).)

## Links

- Site: https://zapzapapi.com
- Painel: https://app.zapzapapi.com
- Docs para IA: https://api.zapzapapi.com/llms.txt
- n8n community nodes: https://docs.n8n.io/integrations/community-nodes/

## Licença

[MIT](LICENSE) © Rodrigo Damazio
