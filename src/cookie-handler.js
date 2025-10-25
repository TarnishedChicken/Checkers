export default class CookieHandler{
    constructor(){
        this.caches=new Map()
    }
    setCookie(varKey, val,expDays,toCache=true){
        const d=new Date()
        d.setTime(d.getTime()+toMs(expDays))
        document.cookie=`${varKey}=${val}; expires=${d.toUTCString()}; path=/`
        if(toCache) this.caches.set(varKey,val)
    }
    getCookie(varKey, toCache=false){
        let cookies=decodeURIComponent(document.cookie).split(";")
        for(let cookie of cookies){
            let ci=cookie.indexOf(varKey)
            if(ci==-1) continue
            let cval=cookie.substring(ci+1,cookie.length)
            if(toCache) this.caches.set(keyVal,cval)
            return cval
        }
        if(toCache) this.caches.set(keyVal,null)
        return null
    }
    getCache(varKey){
        return this.caches.get(varKey)
    }
    toMs(days){
        return days*24*60*60*1000
    }
    initCookies(varKeys){
        for(let varKey of varKeys){
            this.getCookie(varKey,true)
        }
    }
}