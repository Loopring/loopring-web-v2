export enum LayoutConfig {
    basicLayout,
    layout1,
    layout2
}

const basicLayout={
    breakpoints:{xlg:1920 ,lg: 1600, md: 1200, sm: 768, xs: 480, xxs: 0},
    cols:{xlg:24, lg: 24, md: 24, sm: 12, xs: 6, xxs: 6},
    layouts:{
        'xlg':[
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:4,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:4,h:120,minW:4,minH:70},
            {i:'market',    x:4,y:10,w:4,h:87,minW:4,minH:36},
            {i:'market2',   x:8,y:10,w:4,h:87,minW:4,minH:36},
            {i:'chart',     x:13,y:10,w:12,h:87,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:20,h:56,minW:6,minH:36},
        ],
        'lg':[
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:4,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:4,h:98,minW:4,minH:70},
            {i:'market',    x:4,y:10,w:4,h:77,minW:4,minH:36},
            {i:'market2',   x:8,y:10,w:4,h:77,minW:4,minH:36},
            {i:'chart',     x:13,y:10,w:12,h:77,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:20,h:44,minW:6,minH:36},
        ],
        'md':[
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:5,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:5,h:70,minW:4,minH:70},
            {i:'market',    x:5,y:10,w:5,h:57,minW:4,minH:36},
            {i:'market2',   x:0,y:0,w:0,h:0,minW:0,minH:0},
            {i:'chart',     x:10,y:10,w:14,h:57,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:19,h:36,minW:6,minH:36},
        ],
        'sm':[
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:5,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:5,h:69,minW:4,minH:70},
            {i:'market',    x:5,y:10,w:5,h:56,minW:4,minH:36},
            {i:'market2',   x:0,y:0,w:0,h:0,minW:0,minH:0},
            {i:'chart',     x:10,y:10,w:14,h:56,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:19,h:36,minW:6,minH:36},
        ],
        'xs': [
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:5,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:5,h:69,minW:4,minH:70},
            {i:'market',    x:5,y:10,w:5,h:56,minW:4,minH:36},
            {i:'market2',   x:0,y:0,w:0,h:0,minW:0,minH:0},
            {i:'chart',     x:10,y:10,w:14,h:56,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:19,h:36,minW:6,minH:36},
        ],
        xxs: [
            {i:'toolbar',   x:0,y:0,w:24,h:9,minW:24,minH:9},
            {i:'walletInfo',x:0,y:10,w:5,h:23,minW:4,minH:22},
            {i:'spot',      x:0,y:14,w:5,h:69,minW:4,minH:70},
            {i:'market',    x:5,y:10,w:5,h:56,minW:4,minH:36},
            {i:'market2',   x:0,y:0,w:0,h:0,minW:0,minH:0},
            {i:'chart',     x:10,y:10,w:14,h:56,minW:6,minH:32},
            {i:'orderTable',x:5,y:64,w:19,h:36,minW:6,minH:36},
        ],
    }
}
// const layout1={}
// const layout2={}

export const  layoutConfigs:Array<typeof basicLayout> = [basicLayout]

