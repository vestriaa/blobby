export const commands = [
    {
        name: "echo",
        description: "say something",
        options: [
            {
                name: "message",
                description: "Something to say",
                required: true,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "ask",
        description: "Ask blobby something",
        options: [
            {
                name: "message",
                description: "Something to ask blobby",
                required: true,
                type: 3,
                max_length: 300
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    }
];
