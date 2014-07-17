({
    appDir: "../demo/js",
    baseUrl: "./",
    dir: "../demo/dist",
    paths: {
        log: "a",
        storeinc:"../storeinc"
    },
    storeinc: true,
    storedir: "../demo/storeincdist",
    lastver:"2",
    ver:'3',
    chunkSize:12,
    modules: [
        {
            name: "test",
            exclude: [
                "log","b","c","d","storeinc"
            ]
        },
        {
            name: "log",
            exclude: [
               "storeinc"
            ]
        },
        {
            name: "b",
            exclude: [
                "storeinc","log"
            ]
        },
    ]

})