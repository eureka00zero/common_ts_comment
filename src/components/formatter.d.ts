declare const max:200
declare function showNumFormat(num:number):string
declare function newToOld(data:any):any
declare function addNormalShowData(data:any, agreedList:any):any
declare function formatAllData(topLayer:any, secLayer:any, userInfo:any, agreedList:any):any
declare function formatFakeData(data:any, userInfo:any):any
declare function addSecSpecData(secObj:object):any
declare function mergeSecData(oldData:any, newData:any, isClick?:any):any

declare namespace a {
    function showNumFormat(num:number):string
    function newToOld(data:any):any
    function addNormalShowData(data:any, agreedList:any):any
    function formatAllData(topLayer:any, secLayer:any, userInfo:any, agreedList:any):any
    function formatFakeData(data:any, userInfo:any):any
    function addSecSpecData(secObj:object):any
    function mergeSecData(oldData:any, newData:any, isClick?:any):any
}

export default a;