import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class ZapZap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapZap',
		name: 'zapZap',
		icon: 'file:zapzap.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Envie mensagens de WhatsApp e gerencie instâncias pela ZapZap API',
		defaults: {
			name: 'ZapZap',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zapZapApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ========================= RESOURCE =========================
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Instance', value: 'instance' },
				],
				default: 'message',
			},

			// ========================= MESSAGE: OPERATIONS =========================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						action: 'Send a text message',
						description: 'Envia uma mensagem de texto simples',
						routing: {
							request: {
								method: 'POST',
								url: '=/{{$parameter.instanceId}}/send/text',
							},
						},
					},
					{
						name: 'Send Media',
						value: 'sendMedia',
						action: 'Send media',
						description: 'Envia imagem, vídeo, áudio, documento ou figurinha por URL',
						routing: {
							request: {
								method: 'POST',
								url: '=/{{$parameter.instanceId}}/send/media',
							},
						},
					},
					{
						name: 'Send Interactive',
						value: 'sendInteractive',
						action: 'Send an interactive message',
						description: 'Envia enquete, botões ou lista de opções',
						routing: {
							request: {
								method: 'POST',
								url: '=/{{$parameter.instanceId}}/send/{{$parameter.interactiveType}}',
							},
						},
					},
					{
						name: 'React',
						value: 'react',
						action: 'React to a message',
						description: 'Reage com um emoji a uma mensagem existente',
						routing: {
							request: {
								method: 'POST',
								url: '=/{{$parameter.instanceId}}/message/react',
							},
						},
					},
				],
				default: 'sendText',
			},

			// ========================= INSTANCE: OPERATIONS =========================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['instance'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create an instance',
						description: 'Cria uma nova instância WhatsApp (debita do saldo)',
						routing: {
							request: {
								method: 'POST',
								url: '/instances',
							},
						},
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						action: 'Get connection status',
						description: 'Retorna o status da conexão WhatsApp da instância',
						routing: {
							request: {
								method: 'GET',
								url: '=/{{$parameter.instanceId}}/instance/status',
							},
						},
					},
					{
						name: 'Get QR Code',
						value: 'getQrCode',
						action: 'Get QR code',
						description: 'Retorna o QR Code para conectar o WhatsApp à instância',
						routing: {
							request: {
								method: 'GET',
								url: '=/instances/{{$parameter.instanceId}}/qrcode',
							},
						},
					},
					{
						name: 'List',
						value: 'list',
						action: 'List instances',
						description: 'Lista todas as instâncias da conta',
						routing: {
							request: {
								method: 'GET',
								url: '/instances',
							},
						},
					},
				],
				default: 'create',
			},

			// ========================= INSTANCE ID (shared) =========================
			{
				displayName: 'Instance ID',
				name: 'instanceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'uuid-da-instancia',
				description: 'ID da instância WhatsApp (o UUID retornado ao criar/listar instâncias)',
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
			},
			{
				displayName: 'Instance ID',
				name: 'instanceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'uuid-da-instancia',
				description: 'ID da instância WhatsApp (o UUID retornado ao criar/listar instâncias)',
				displayOptions: {
					show: {
						resource: ['instance'],
						operation: ['getStatus', 'getQrCode'],
					},
				},
			},

			// ========================= MESSAGE > NUMBER (shared send/react) =========================
			{
				displayName: 'Number',
				name: 'number',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5511999999999',
				description:
					'Número do destinatário no formato internacional: DDI + DDD + número, só dígitos (ex: 5511999999999). Para grupos use o ID do grupo (@g.us).',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText', 'sendMedia', 'sendInteractive', 'react'],
					},
				},
				routing: { send: { type: 'body', property: 'number' } },
			},

			// ========================= MESSAGE > SEND TEXT =========================
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 3 },
				required: true,
				default: '',
				placeholder: 'Olá! Tudo bem?',
				description: 'Conteúdo da mensagem de texto',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
				routing: { send: { type: 'body', property: 'text' } },
			},
			{
				displayName: 'Options',
				name: 'textOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
				options: [
					{
						displayName: 'Mentions',
						name: 'mentions',
						type: 'string',
						default: '',
						placeholder: 'all',
						description:
							'Só em grupo. "all" marca todos (menção oculta que fura o silêncio), ou lista de números separados por vírgula.',
						routing: { send: { type: 'body', property: 'mentions' } },
					},
					{
						displayName: 'Reply To Message ID',
						name: 'replyid',
						type: 'string',
						default: '',
						description: 'ID da mensagem a ser respondida (citação)',
						routing: { send: { type: 'body', property: 'replyid' } },
					},
					{
						displayName: 'Delay (Ms)',
						name: 'delay',
						type: 'number',
						default: 0,
						description: 'Atraso antes de enviar, em milissegundos (exibe "digitando...")',
						routing: { send: { type: 'body', property: 'delay' } },
					},
				],
			},

			// ========================= MESSAGE > SEND MEDIA =========================
			{
				displayName: 'Media Type',
				name: 'type',
				type: 'options',
				default: 'image',
				description: 'Tipo de mídia a enviar',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
				options: [
					{ name: 'Audio (File)', value: 'audio', description: 'Áudio como arquivo (MP3, OGG, WAV)' },
					{ name: 'Document', value: 'document', description: 'Documento (PDF, DOCX, XLSX…). Use Doc Name.' },
					{ name: 'Image', value: 'image', description: 'Imagem (JPG, PNG, GIF, WebP)' },
					{ name: 'Sticker', value: 'sticker', description: 'Figurinha (WebP)' },
					{ name: 'Video', value: 'video', description: 'Vídeo (MP4, AVI, MOV)' },
					{ name: 'Video Note (PTV)', value: 'ptv', description: 'Recado de vídeo (nota redonda). Ignora legenda.' },
					{ name: 'Voice (PTT)', value: 'ptt', description: 'Áudio de voz / push-to-talk (bolha de microfone)' },
				],
				routing: { send: { type: 'body', property: 'type' } },
			},
			{
				displayName: 'File URL',
				name: 'file',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://exemplo.com/arquivo.jpg',
				description:
					'URL pública do arquivo. Limite por URL: imagem/vídeo/áudio ~190 MB, documento ~500 MB.',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
				routing: { send: { type: 'body', property: 'file' } },
			},
			{
				displayName: 'Options',
				name: 'mediaOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
				options: [
					{
						displayName: 'Caption',
						name: 'text',
						type: 'string',
						typeOptions: { rows: 2 },
						default: '',
						description: 'Legenda (apenas imagem e vídeo). Ignorada em ptv.',
						routing: { send: { type: 'body', property: 'text' } },
					},
					{
						displayName: 'Document Name',
						name: 'docName',
						type: 'string',
						default: '',
						placeholder: 'arquivo.pdf',
						description: 'Nome exibido no chat. Obrigatório para type=document.',
						routing: { send: { type: 'body', property: 'docName' } },
					},
					{
						displayName: 'Mentions',
						name: 'mentions',
						type: 'string',
						default: '',
						placeholder: 'all',
						description: 'Só em grupo. "all" ou lista de números separados por vírgula.',
						routing: { send: { type: 'body', property: 'mentions' } },
					},
					{
						displayName: 'Delay (Ms)',
						name: 'delay',
						type: 'number',
						default: 0,
						description: 'Atraso antes de enviar, em milissegundos',
						routing: { send: { type: 'body', property: 'delay' } },
					},
				],
			},

			// ========================= MESSAGE > SEND INTERACTIVE =========================
			{
				displayName: 'Interactive Type',
				name: 'interactiveType',
				type: 'options',
				default: 'poll',
				description: 'Tipo de mensagem interativa',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'] },
				},
				options: [
					{ name: 'Poll', value: 'poll', description: 'Enquete nativa do WhatsApp (/send/poll)' },
					{ name: 'Buttons', value: 'buttons', description: 'Até 3 botões clicáveis (/send/buttons)' },
					{ name: 'List', value: 'list', description: 'Menu em lista com seções e itens (/send/list)' },
				],
			},
			{
				displayName: 'Text',
				name: 'interactiveText',
				type: 'string',
				typeOptions: { rows: 2 },
				required: true,
				default: '',
				placeholder: 'Escolha uma opção:',
				description: 'Texto principal (pergunta da enquete, corpo dos botões ou da lista)',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'] },
				},
				routing: { send: { type: 'body', property: 'text' } },
			},
			// Poll fields
			{
				displayName: 'Choices (JSON Array)',
				name: 'pollChoices',
				type: 'json',
				required: true,
				default: '["Opção 1", "Opção 2"]',
				description: 'Array de strings com as opções de voto',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['poll'] },
				},
				routing: { send: { type: 'body', property: 'choices', value: '={{ JSON.parse($value) }}' } },
			},
			{
				displayName: 'Selectable Count',
				name: 'selectableCount',
				type: 'number',
				default: 1,
				description: 'Quantos votos cada pessoa pode marcar (>1 = múltipla escolha, 0 = ilimitado)',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['poll'] },
				},
				routing: { send: { type: 'body', property: 'selectableCount' } },
			},
			// Buttons fields
			{
				displayName: 'Buttons (JSON Array)',
				name: 'buttonsJson',
				type: 'json',
				required: true,
				default:
					'[{"text":"Sim","id":"yes"},{"text":"Nosso site","url":"https://exemplo.com"}]',
				description: 'Até 3 botões. text+ID = resposta rápida; text+URL = abre link; text+phone = ligar; text+copy = copiar código.',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['buttons'] },
				},
				routing: { send: { type: 'body', property: 'buttons', value: '={{ JSON.parse($value) }}' } },
			},
			{
				displayName: 'Options',
				name: 'buttonsOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['buttons'] },
				},
				options: [
					{
						displayName: 'Image URL',
						name: 'image',
						type: 'string',
						default: '',
						placeholder: 'https://exemplo.com/banner.jpg',
						description: 'Imagem exibida no topo dos botões',
						routing: { send: { type: 'body', property: 'image' } },
					},
					{
						displayName: 'Footer',
						name: 'footer',
						type: 'string',
						default: '',
						description: 'Texto do rodapé',
						routing: { send: { type: 'body', property: 'footer' } },
					},
				],
			},
			// List fields
			{
				displayName: 'Choices (JSON Array)',
				name: 'listChoices',
				type: 'json',
				required: true,
				default: '["[Produtos]", "Camiseta|p1|R$ 50", "Calça|p2|R$ 120"]',
				description: 'Use "[Seção]" para cabeçalho e "Item|ID|descrição" para cada item selecionável',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['list'] },
				},
				routing: { send: { type: 'body', property: 'choices', value: '={{ JSON.parse($value) }}' } },
			},
			{
				displayName: 'Options',
				name: 'listOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['list'] },
				},
				options: [
					{
						displayName: 'List Button Text',
						name: 'listButton',
						type: 'string',
						default: '',
						placeholder: 'Ver opções',
						description: 'Texto do botão que abre a lista',
						routing: { send: { type: 'body', property: 'listButton' } },
					},
					{
						displayName: 'Footer Text',
						name: 'footerText',
						type: 'string',
						default: '',
						description: 'Texto do rodapé',
						routing: { send: { type: 'body', property: 'footerText' } },
					},
				],
			},

			// ========================= MESSAGE > REACT =========================
			{
				displayName: 'Message ID',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5511991515364:2A6E2F02CE4125FDBA1B',
				description:
					'ID da mensagem no formato OWNER:MSGID (ex: 5511991515364:2A6E2F02CE4125FDBA1B). Não use o formato Baileys concatenado com JID.',
				displayOptions: {
					show: { resource: ['message'], operation: ['react'] },
				},
				routing: { send: { type: 'body', property: 'id' } },
			},
			{
				displayName: 'Emoji',
				name: 'emoji',
				type: 'string',
				required: true,
				default: '',
				placeholder: '👍',
				description: 'Emoji da reação. Deixe vazio para remover a reação.',
				displayOptions: {
					show: { resource: ['message'], operation: ['react'] },
				},
				routing: { send: { type: 'body', property: 'emoji' } },
			},

			// ========================= INSTANCE > CREATE =========================
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'minha-instancia',
				description: 'Nome da instância. Apenas letras, números, _ e -.',
				displayOptions: {
					show: { resource: ['instance'], operation: ['create'] },
				},
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'Options',
				name: 'createOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				displayOptions: {
					show: { resource: ['instance'], operation: ['create'] },
				},
				options: [
					{
						displayName: 'System Name',
						name: 'systemName',
						type: 'string',
						default: '',
						placeholder: 'Meu App',
						description: 'Nome do sistema exibido no WhatsApp',
						routing: { send: { type: 'body', property: 'systemName' } },
					},
					{
						displayName: 'Metadata (JSON)',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description:
							'Dados livres para vincular ao seu sistema (ex: {"clientId":"123"}). Volta nos webhooks.',
						routing: { send: { type: 'body', property: 'metadata', value: '={{ JSON.parse($value) }}' } },
					},
				],
			},
		],
	};
}
