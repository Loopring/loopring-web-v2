export enum LayoutConfig {
    basicLayout,
    layout1,
    layout2
}
const basicLayout={
    layout:[
        {i:'toolbar',x:0,y:0,w:12,h:48,minW:24},
        {i:'walletInfo',x:0,y:49,w:5,h:44,minW:4,minH:44},
        {i:'spot',x:0,y:43,w:5,h:140,minW:4,minH:112},
        {i:'market',x:5,y:4,w:5,h:116,minW:4,minH:116},
        {i:'chart',x:10,y:4,w:14,h:116,minW:6,minH:80},
        {i:'orderTable',x:5,y:4,w:19,h:68,minW:6,minH:36},
    ]
}
// const layout1={}
// const layout2={}

export const  layoutConfigs:Array<typeof basicLayout> = [basicLayout]

