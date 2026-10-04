import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class ZapZap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapZap',
		name: 'zapZap',
		icon: 'file:zapzap.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages and manage instances through the ZapZap API',
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
						description: 'Send a plain text message to a WhatsApp number',
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
						description: 'Send an image, video, audio, document or sticker from a public URL',
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
						description: 'Send a poll, buttons or an option list',
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
						description: 'React with an emoji to an existing message',
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
						description: 'Create a new WhatsApp instance (charged from your balance)',
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
						description: 'Get the WhatsApp connection status of the instance',
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
						description: 'Get the QR code to connect WhatsApp to the instance',
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
						description: 'List every instance in your account',
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
				placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
				description:
					'WhatsApp instance identifier (the UUID returned when you create or list instances). Find it in your instances list or in the panel at app.zapzapapi.com.',
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
				placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
				description:
					'WhatsApp instance identifier (the UUID returned when you create or list instances). Find it in your instances list or in the panel at app.zapzapapi.com.',
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
					'Recipient number in international format: country code + area code + number, digits only (e.g. 5511999999999). For groups, use the group ID (ending in @g.us).',
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
				placeholder: 'Hi! How are you?',
				description: 'Content of the text message',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
				routing: { send: { type: 'body', property: 'text' } },
			},
			{
				displayName: 'Options',
				name: 'textOptions',
				type: 'collection',
				placeholder: 'Add option',
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
							'Groups only. Use "all" to mention every member (hidden mention that still notifies everyone), or a comma-separated list of numbers.',
						routing: { send: { type: 'body', property: 'mentions' } },
					},
					{
						displayName: 'Reply to Message ID',
						name: 'replyid',
						type: 'string',
						default: '',
						description: 'ID of the message to reply to (quote)',
						routing: { send: { type: 'body', property: 'replyid' } },
					},
					{
						displayName: 'Delay (Ms)',
						name: 'delay',
						type: 'number',
						default: 0,
						description: 'Delay before sending, in milliseconds (shows the "typing..." indicator)',
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
				description: 'Type of media to send',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
				options: [
					{ name: 'Audio (File)', value: 'audio', description: 'Audio as a file (MP3, OGG, WAV)' },
					{ name: 'Document', value: 'document', description: 'Document (PDF, DOCX, XLSX and similar). Set Document Name.' },
					{ name: 'Image', value: 'image', description: 'Image (JPG, PNG, GIF, WebP)' },
					{ name: 'Native Audio (Myaudio)', value: 'myaudio', description: 'WhatsApp native audio (OGG/Opus), similar to a voice note' },
					{ name: 'Sticker', value: 'sticker', description: 'Sticker (WebP)' },
					{ name: 'Video', value: 'video', description: 'Video (MP4, AVI, MOV)' },
					{ name: 'Video Note (PTV)', value: 'ptv', description: 'Round video note. Always circular and ignores the caption.' },
					{ name: 'Voice (PTT)', value: 'ptt', description: 'Voice note / push-to-talk (microphone bubble)' },
				],
				routing: { send: { type: 'body', property: 'type' } },
			},
			{
				displayName: 'File URL',
				name: 'file',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com/file.jpg',
				description:
					'Public URL of the file. Size limit per URL: around 190 MB for image, video and audio, and around 500 MB for documents.',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
				routing: { send: { type: 'body', property: 'file' } },
			},
			{
				displayName: 'Options',
				name: 'mediaOptions',
				type: 'collection',
				placeholder: 'Add option',
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
						description: 'Caption (image and video only). Ignored for video notes (ptv).',
						routing: { send: { type: 'body', property: 'text' } },
					},
					{
						displayName: 'Document Name',
						name: 'docName',
						type: 'string',
						default: '',
						placeholder: 'file.pdf',
						description: 'File name shown in the chat. Required when Media Type is Document.',
						routing: { send: { type: 'body', property: 'docName' } },
					},
					{
						displayName: 'Mentions',
						name: 'mentions',
						type: 'string',
						default: '',
						placeholder: 'all',
						description: 'Groups only. Use "all" or a comma-separated list of numbers.',
						routing: { send: { type: 'body', property: 'mentions' } },
					},
					{
						displayName: 'Delay (Ms)',
						name: 'delay',
						type: 'number',
						default: 0,
						description: 'Delay before sending, in milliseconds',
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
				description: 'Type of interactive message',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'] },
				},
				options: [
					{ name: 'Poll', value: 'poll', description: 'Native WhatsApp poll (/send/poll)' },
					{ name: 'Buttons', value: 'buttons', description: 'Up to 3 clickable buttons (/send/buttons)' },
					{ name: 'List', value: 'list', description: 'Menu list with sections and items (/send/list)' },
				],
			},
			{
				displayName: 'Text',
				name: 'interactiveText',
				type: 'string',
				typeOptions: { rows: 2 },
				required: true,
				default: '',
				placeholder: 'Choose an option:',
				description: 'Main text (the poll question, or the body of the buttons or list)',
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
				default: '["Option 1", "Option 2"]',
				description: 'Array of strings with the poll options',
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
				description: 'How many options each person can pick (greater than 1 means multiple choice, 0 means unlimited)',
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
					'[{"text":"Yes","id":"yes"},{"text":"Our site","url":"https://example.com"}]',
				description:
					'Up to 3 buttons. Use text + ID for a quick reply, text + URL to open a link, text + phone to call, or text + copy to copy a code.',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['buttons'] },
				},
				routing: { send: { type: 'body', property: 'buttons', value: '={{ JSON.parse($value) }}' } },
			},
			{
				displayName: 'Options',
				name: 'buttonsOptions',
				type: 'collection',
				placeholder: 'Add option',
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
						placeholder: 'https://example.com/banner.jpg',
						description: 'Image shown above the buttons',
						routing: { send: { type: 'body', property: 'image' } },
					},
					{
						displayName: 'Footer',
						name: 'footer',
						type: 'string',
						default: '',
						description: 'Footer text',
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
				default: '["[Products]", "T-shirt|p1|$ 50", "Pants|p2|$ 120"]',
				description: 'Use "[Section]" for a header and "Label|value|description" for each selectable item',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendInteractive'], interactiveType: ['list'] },
				},
				routing: { send: { type: 'body', property: 'choices', value: '={{ JSON.parse($value) }}' } },
			},
			{
				displayName: 'Options',
				name: 'listOptions',
				type: 'collection',
				placeholder: 'Add option',
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
						placeholder: 'View options',
						description: 'Text of the button that opens the list',
						routing: { send: { type: 'body', property: 'listButton' } },
					},
					{
						displayName: 'Footer Text',
						name: 'footerText',
						type: 'string',
						default: '',
						description: 'Small text shown below the list',
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
					'Message ID in the OWNER:MSGID format (e.g. 5511991515364:2A6E2F02CE4125FDBA1B). Do not use the Baileys format concatenated with the JID.',
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
				description: 'Reaction emoji. Leave empty to remove the reaction.',
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
				placeholder: 'my-instance',
				description: 'Instance name. Letters, numbers, _ and - only.',
				displayOptions: {
					show: { resource: ['instance'], operation: ['create'] },
				},
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'Options',
				name: 'createOptions',
				type: 'collection',
				placeholder: 'Add option',
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
						placeholder: 'My App',
						description: 'System name shown on WhatsApp',
						routing: { send: { type: 'body', property: 'systemName' } },
					},
					{
						displayName: 'Metadata (JSON)',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description:
							'Free-form data to link the instance to your system (e.g. {"clientId":"123"}). It is returned on webhook events.',
						routing: { send: { type: 'body', property: 'metadata', value: '={{ JSON.parse($value) }}' } },
					},
				],
			},
		],
	};
}
