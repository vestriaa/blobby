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
                name: “user_name”,
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
                name: “verified”,
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
                name: “title”,
                required: true,
                type: 3
            },
            {
                name: “creator”,
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
                name: “command”,
                required: true,
                type: 3,
                choices: [
                    {
                        name: “list”
                    },
                    {
                        name: “top”
                    },
                    {
                        name: “add”
                    },
                    {
                        name: “remove”
                    },
                    {
                        name: “promote”
                    },
                    {
                        name: “demote”
                    }
                ]
            },
            {
                name: “link”,
                required: false,
                type: 3
            }
        ]
    }
];
