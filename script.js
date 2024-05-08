
/*
List all events in a time range:
GET https://mybrightday.brighthorizons.com/remote/v1/events?direction=range&earliest_event_time=1709272800&latest_event_time=1711947600&num_events=300&client=dashboard

Download an attachment:
GET https://mybrightday.brighthorizons.com/remote/v1/obj_attachment?obj=65e0dcdb488dc29b12b8395d&key=65e0dcdb488dc29b12b8395c&download=true

Run this function in the console of the My Bright Day dashboard.

*/

async function download(startTime, endTime) {
    const baseUrl = "https://mybrightday.brighthorizons.com/remote/v1/";
    const listPath = "events";
    const imgPath = "obj_attachment";

    let listUrl = new URL(baseUrl + listPath);
    listUrl.search = new URLSearchParams({
        direction: "range",
        earliest_event_time: startTime,
        latest_event_time: endTime,
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
        "Referer": window.location.href, // The current URL
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
    var filename = "";

    for(let i = 0; i < res["events"].length; i++) {
        let elem = res["events"][i];
        console.log(`Processing event ${i} of ${res["events"].length}:`, elem);
        let action = elem["action"];
        if (action != "ShareOnly" && action != "Notify" && "key" in elem && "attachments" in elem) {
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
                    let blob = await fetch(downloadUrl, {
                        method: "GET",
                        credentials: "same-origin",
                        headers: new Headers({
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "Accept-Encoding": "gzip, deflate, br, zstd",
                            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6",
                            "Referer": window.location.href,
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
                    })
                    .then((result) => {
                        if (!result.ok) {
                            throw Error(result.statusText);
                        }

                        // We are reading the *Content-Disposition* header for getting the original filename given from the server
                        // Looks like this: `attachment; filename="2024-03-08 19:33:00.483000.jpg"`
                        filename = result.headers.get('Content-Disposition').split(';')[1].split('=')[1].replaceAll("\"", "");

                        // Append comment to filename
                        if("comment" in elem && elem["comment"] != null) {
                            let name = filename.substring(0, filename.lastIndexOf('.'));
                            let ext = filename.split('.').pop();
                            filename = `${name}-${elem["comment"].replace(/[/\\?%*:|"<>]/g, '-')}.${ext}`;
                        }

                        return result.blob();
                    });

                    // Write out blob in sync path to block the next fetch call until download is complete.
                    if (blob != null) {
                        count += 1;
                        console.log(`Download count: ${count}. For ${key} with filename ${filename}`)
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement("a");
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


let date = new Date();
let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1).getTime() / 1000;
let lastDay = new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000 - 1;

await download(firstDay, lastDay);