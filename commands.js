export const commands = [
    {
        name: "level",
        description: "Get a level link",
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
                required: false,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "unbeaten",
        description: "Get the current unbeaten levels list",
    },
    {
        name: "id",
        description: "Get a players id",
        options: [
            {
                name: "username",
                description: "Player username",
                required: true,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
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
        integration_types: [0, 1],
        contexts: [0, 1, 2]
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
                description: "Player username",
                required: true,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "whois",
        description: "Get a players cosmetic details and role",
        options: [
            {
                name: "username",
                description: "Player username",
                required: true,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
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
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "newest",
        description: "Get the newest level globally or by creator",
        options: [
            {
                name: "creator",
                description: "creators username",
                required: false,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "oldest",
        description: "Get the oldest level of a creator",
        options: [
            {
                name: "creator",
                description: "creators username",
                required: true,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
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
                required: false,
                type: 3
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "gethardest",
        description: "Get the nth level on the Hardest Levels List",
        options: [
            {
                name: "position",
                description: "Position on the list",
                required: true,
                type: 4
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
                        name: "add",
                        value: "add"
                    },
                    {
                        name: "remove",
                        value: "remove"
                    },
                    {
                        name: "move",
                        value: "move"
                    },
                    {
                        name: "page",
                        value: "page"
                    }
                ]
            },
            {
                name: "link",
                description: "Link to the level",
                required: false,
                type: 3
            },
            {
                name: "number",
                description: "Position to move or add to, or page number",
                required: false,
                type: 4
            }
        ]
    },
    {
        name: "wiki",
        description: "Search the wiki",
        options: [
            {
                name: "query",
                description: "Search query",
                required: true,
                type: 3
            },
            {
                name: "sort",
                description: "Sorting order (default is relevance)",
                required: false,
                type: 3,
                choices: [
                    {
                        name: "Random",
                        value: "random"
                    },
                    {
                        name: "Incoming links",
                        value: "incoming_links_asc"
                    },
                    {
                        name: "Relevance (default)",
                        value: "relevance"
                    },
                    {
                        name: "Creation date",
                        value: "create_timestamp_asc"
                    },
                    {
                        name: "None",
                        value: "none"
                    },
                    {
                        name: "Just Match",
                        value: "just_match"
                    },
                    {
                        name: "Last edit",
                        value: "last_edit_asc"
                    },
                    {
                        name: "Creation date reverse",
                        value: "create_timestamp_desc"
                    },
                    {
                        name: "Incoming links reverse",
                        value: "incoming_links_desc"
                    },
                    {
                        name: "Last edit reverse",
                        value: "last_edit_desc"
                    }
                ]
            }
        ],
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "Get leaderboard",
        type: 3,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "Get creator",
        type: 3,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "Get complexity",
        type: 3,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "Get iterations",
        type: 3,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
    {
        name: "Get thumbnail",
        type: 3,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    }
    // {
    //     name: "Add to fanart",
    //     type: 3,
    //     integration_types: [0, 1],
    //     contexts: [0, 1, 2]
    // }
];
