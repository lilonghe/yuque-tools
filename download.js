async function startDownload(book_id) {
    if (!book_id) {
        throw("need book_id");
        return;
    }
    let fetchOptions = {
        "headers": {
          "accept": "application/json",
          "accept-language": "zh-CN,zh;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-csrf-token": getCToken(),
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": window.location.href,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    };

    let articles = await getArticles(book_id);
    if(articles && articles.length) {
        for(let i=0; i<articles.length; i++) {
            let article = articles[i];
            if (article.published_at) {
                await saveArticle(article);
                await wait();
            }
        }
    }

    async function getArticles(book_id) {
        return window.appData.book.docs;
        let resp = await fetch(`/api/docs?book_id=${book_id}&include_last_editor=true&include_share=true&include_user=true&only_order_by_id=false`, fetchOptions).
            then(res=>res.json());
        return resp.data;
    }
    
    async function saveArticle(article) {
        const {created_at, content_updated_at, title, slug, draft_version} = article;
        let url = getArticlePath(slug);
        console.log(url);
        return await fetch(url, fetchOptions).then(res=>res.text()).then(res=>{
            res = 'create_time=' + created_at + "\n" + res;
            saveFile(res, title + ".md");
            return res;
        });
    }
    
    async function wait(time=1000) {
        return new Promise((r)=> {
            setTimeout(()=>{
                r();
            }, time);
        })
    }
    
    function getArticlePath(articleSlug) {
        let path = "/" + (window.location.pathname.split("/").slice(2,4).join('/')) + "/" + articleSlug + "/markdown";
        let query = "attachment=true&latexcode=false&anchor=false&linebreak=false"
        return path + "?" + query;
    }
    
    function saveFile(content, name) {
        let blob = new Blob([content]);
        let url = URL.createObjectURL(blob);
        let ele = document.createElement('a');
        ele.href = url;
        ele.download = name;
        ele.click();
    }

    function getCToken() {
        return document.cookie.split(";").find(item=>item.includes("yuque_ctoken=")).split("=")[1];
    }
}
