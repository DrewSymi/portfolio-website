// ==================== DATA CONFIGURATION ====================

const DATA = {
    // Network nodes configuration
    networkNodes: [
        { id: 'firewall', x: 0.2, y: 0.3, type: 'firewall', label: 'FIREWALL' },
        { id: 'gateway', x: 0.4, y: 0.3, type: 'gateway', label: 'GATEWAY' },
        { id: 'auth', x: 0.6, y: 0.3, type: 'auth', label: 'AUTH SERVER' },
        { id: 'db', x: 0.8, y: 0.3, type: 'database', label: 'DATABASE' },
        { id: 'client1', x: 0.3, y: 0.7, type: 'client', label: 'CLIENT-01' },
        { id: 'client2', x: 0.5, y: 0.7, type: 'client', label: 'CLIENT-02' },
        { id: 'client3', x: 0.7, y: 0.7, type: 'client', label: 'CLIENT-03' },
        { id: 'monitor', x: 0.5, y: 0.1, type: 'monitor', label: 'SOC' }
    ],

    // Network connections
    networkConnections: [
        { from: 'firewall', to: 'gateway' },
        { from: 'gateway', to: 'auth' },
        { from: 'auth', to: 'db' },
        { from: 'client1', to: 'gateway' },
        { from: 'client2', to: 'gateway' },
        { from: 'client3', to: 'gateway' },
        { from: 'monitor', to: 'auth' }
    ],

    // Active security policies
    policies: [
        { id: 'mfa', name: 'Multi-Factor Authentication', status: 'ACTIVE' },
        { id: 'geo', name: 'Geo-Fencing Policy', status: 'ACTIVE' },
        { id: 'rate', name: 'Rate Limiting', status: 'ACTIVE' },
        { id: 'encrypt', name: 'End-to-End Encryption', status: 'ACTIVE' }
    ],

    // Scenario configurations
    scenarios: {
        normal: {
            name: 'Normal Authentication',
            threatLevel: 'LOW',
            events: [
                { type: 'info', message: 'User authentication request received', delay: 0 },
                { type: 'success', message: 'Credentials validated successfully', delay: 1000 },
                { type: 'success', message: 'MFA token verified', delay: 2000 },
                { type: 'success', message: 'Access granted to user', delay: 3000 }
            ],
            riskLevels: { auth: 25, network: 15, data: 10 },
            policyPath: ['firewall', 'gateway', 'auth', 'db'],
            heatmapIntensity: 0.3
        },
        suspicious: {
            name: 'Suspicious Activity Detected',
            threatLevel: 'MEDIUM',
            events: [
                { type: 'warning', message: 'Unusual login location detected', delay: 0 },
                { type: 'warning', message: 'Multiple failed authentication attempts', delay: 1000 },
                { type: 'warning', message: 'Triggering additional verification', delay: 2000 },
                { type: 'info', message: 'Security team notified', delay: 3000 },
                { type: 'success', message: 'User verified via secondary channel', delay: 4500 }
            ],
            riskLevels: { auth: 65, network: 45, data: 30 },
            policyPath: ['firewall', 'gateway', 'auth', 'monitor'],
            heatmapIntensity: 0.6
        },
        breach: {
            name: 'Breach Attempt',
            threatLevel: 'HIGH',
            events: [
                { type: 'error', message: 'ALERT: Credential stuffing attack detected', delay: 0 },
                { type: 'error', message: 'Source IP blacklisted: 203.0.113.42', delay: 800 },
                { type: 'error', message: 'Automated login patterns identified', delay: 1600 },
                { type: 'warning', message: 'Firewall rules updated', delay: 2400 },
                { type: 'warning', message: 'Affected accounts locked', delay: 3200 },
                { type: 'info', message: 'Incident response team activated', delay: 4000 },
                { type: 'success', message: 'Threat neutralized - system secured', delay: 5500 }
            ],
            riskLevels: { auth: 95, network: 85, data: 70 },
            policyPath: ['firewall', 'monitor', 'auth'],
            heatmapIntensity: 0.95
        }
    },

    // Tour steps configuration
    tourSteps: [
        {
            title: 'Welcome to CyberWatch',
            description: 'This enterprise security operations center monitors authentication flows, network topology, and threat detection in real-time. Click "Next" to begin the tour.',
            highlight: null
        },
        {
            title: 'Network Topology',
            description: 'This visualization shows your network infrastructure including firewalls, gateways, authentication servers, and connected clients. Lines represent active connections between nodes.',
            highlight: '.network-panel'
        },
        {
            title: 'Server Infrastructure',
            description: 'Monitor your server rack in pseudo-3D. Each server\'s status is visualized with color-coded indicators. The visualization reacts to security events and system load in real-time.',
            highlight: '.server-room-panel'
        },
        {
            title: 'Event Chain Analyzer',
            description: 'Watch authentication events flow through the system from left to right. Each event is color-coded by severity, allowing you to track the entire authentication lifecycle.',
            highlight: '.event-chain-panel'
        },
        {
            title: 'Risk Metrics',
            description: 'Real-time risk assessment across three critical dimensions: Authentication Risk, Network Anomaly Detection, and Data Exfiltration probability. These metrics update dynamically based on system activity.',
            highlight: '.risk-panel'
        },
        {
            title: 'Scenario Control',
            description: 'Test different security scenarios including normal authentication, suspicious activity, and breach attempts. Each scenario triggers unique event chains, policy beams, and risk calculations.',
            highlight: '.control-panel'
        }
    ]
};