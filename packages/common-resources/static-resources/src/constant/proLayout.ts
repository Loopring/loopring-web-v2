export enum LayoutConfig {
    basicLayout,
    layout1,
    layout2
}
const basicLayout={
    layout:[
        {i:'toolbar',x:0,y:0,w:24,h:9,minW:24,minH:9},
        {i:'walletInfo',x:0,y:10,w:5,h:23,minW:4,minH:22},
        {i:'spot',x:0,y:14,w:5,h:69,minW:4,minH:70},
        {i:'market',x:5,y:10,w:5,h:56,minW:4,minH:36},
        {i:'chart',x:10,y:10,w:14,h:56,minW:6,minH:32},
        {i:'orderTable',x:5,y:64,w:19,h:36,minW:6,minH:36},
    ]
}
// const layout1={}
// const layout2={}

export const  layoutConfigs:Array<typeof basicLayout> = [basicLayout]

