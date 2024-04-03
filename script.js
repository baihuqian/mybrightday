
/*
List:

GET
https://mybrightday.brighthorizons.com/remote/v1/events?direction=range&earliest_event_time=1709272800&latest_event_time=1711947600&num_events=300&client=dashboard



Download:
GET
https://mybrightday.brighthorizons.com/remote/v1/obj_attachment?obj=65e0dcdb488dc29b12b8395d&key=65e0dcdb488dc29b12b8395c&download=true

obj: 6607275a734b0072fdf0692d
key: 6607275a734b0072fdf0692c

*/

const baseUrl = "https://mybrightday.brighthorizons.com/remote/v1/";
const listPath = "events";
const imgPath = "obj_attachment";

let listUrl = new URL(baseUrl + listPath);
listUrl.search = new URLSearchParams({
    direction: "range",
    earliest_event_time: 1690866000,
    latest_event_time: 1693544400,
    num_events: 300,
    client: "dashboard"
});

let res = await fetch(listUrl, {
    method: "GET",
    credentials: "same-origin",
    headers: new Headers({
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6",
    "Referer": "https://mybrightday.brighthorizons.com/dashboard/parents.html?dependent_id=64e693f363a5d4cd7623adeb",
    "Sec-Ch-Ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "\"macOS\"",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Tadpoles-Uid": "5910168",
    })
})
.then((res) => res.json());

console.log("Success:", res);

let count = 0;

for(let elem of res["events"]) {
    console.log(`Processing event:`, elem);
    let action = elem["action"];
    if (action != "ShareOnly" && action != "Notify") {
        if("key" in elem && "attachments" in elem) {
            let attachments = elem["attachments"];
            if(Array.isArray(attachments) && attachments.length) {
                let obj = elem["key"];
                for(let key of attachments) {

                    console.log(`Event has obj ${obj} and key ${key}, attempting download`)

                    let downloadUrl = new URL(baseUrl + imgPath);
                    downloadUrl.search = new URLSearchParams({
                        obj: obj,
                        key: key,
                        download: true
                    });

                    // https://christosmonogios.com/2022/05/10/Use-the-Fetch-API-to-download-files-with-their-original-filename-and-the-proper-way-to-catch-server-errors/
                    let result = await fetch(downloadUrl, {
                        method: "GET",
                        credentials: "same-origin",
                        headers: new Headers({
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "Accept-Encoding": "gzip, deflate, br, zstd",
                            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6",
                            "Referer": "https://mybrightday.brighthorizons.com/dashboard/parents.html?dependent_id=64e693f363a5d4cd7623adeb",
                            "Sec-Ch-Ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                            "Sec-Ch-Ua-Mobile": "?0",
                            "Sec-Ch-Ua-Platform": "\"macOS\"",
                            "Sec-Fetch-Dest": "document",
                            "Sec-Fetch-Mode": "navigate",
                            "Sec-Fetch-Site": "same-origin",
                            "Sec-Fetch-User": "?1",
                            "Upgrade-Insecure-Requests": "1",
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                        })
                    });
                    
                    if (!result.ok) {
                        throw Error(result.statusText);
                    }

                    // We are reading the *Content-Disposition* header for getting the original filename given from the server
                    let filename = result.headers.get('Content-Disposition').split(';')[1].split('=')[1].replaceAll("\"", "");
                    // if("comment" in elem && elem["comment"] != null) {
                    //     var nameParts = filename.split('.');
                    //     filename = nameParts[0] + '-' + elem["comment"].replace(/[/\\?%*:|"<>]/g, '-') + '.' + nameParts[1];
                    // }

                    let blob = result.blob();
                    if (blob != null) {
                        count += 1;
                        console.log(`Download count: ${count}. For ${key} with filename ${filename}`)
                        var url = window.URL.createObjectURL(blob);
                        var a = document.createElement("a");
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    }
                }
            }
        }
    }
}

