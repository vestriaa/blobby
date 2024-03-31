export const commands = [
    {
        name: "unbeaten",
        description: "Get the current unbeaten levels list",
    },
    {
        name: "trending",
        description: "Get the current trending levels list",
    },
    {
        name: "toptrending",
        description: "Get the current top trending level",
    },
    {
        name: "topunbeaten",
        description: "Get the oldest unbeaten level",
    },
    {
        name: "newestunbeaten",
        description: "Get the newest unbeaten level",
    },
    {
        name: "globalstats",
        description: "Get global level statistics",
    },
    {
        name: "actualtrending",
        description: "Get the current trending levels list (but better)",
    },
    {
        name: "player",
        description: "Get a players details and stats",
        options: [
            {
                name: "username",
                description: "Player unsername",
                required: true,
                type: 3
            }
        ]
    },
    {
        name: "random",
        description: "Get a random level",
        options: [
            {
                name: "verified",
                description: "Only return verified levels",
                required: true,
                type: 5
            }
        ]
    },
    {
        name: "leaderboard",
        description: "Get a levels leaderboard",
        options: [
            {
                name: "title",
                description: "Title of the level",
                required: true,
                type: 3
            },
            {
                name: "creator",
                description: "The level creators username",
                required: true,
                type: 3
            }
        ]
    },
    {
        name: "hardest",
        description: "Hardest maps list functionality",
        options: [
            {
                name: "command",
                description: "The command to run",
                required: true,
                type: 3,
                choices: [
                    {
                        name: "list",
                        value: "list"
                    },
                    {
                        name: "top",
                        value: "top"
                    },
                    {
                        name: "add",
                        value: "add"
                    },
                    {
                        name: "remove",
                        value: "remove"
                    },
                    {
                        name: "promote",
                        value: "promote"
                    },
                    {
                        name: "demote",
                        value: "demote"
                    }
                ]
            },
            {
                name: "link",
                description: "Link to the level",
                required: false,
                type: 3
            }
        ]
    }
];
