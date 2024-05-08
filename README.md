# Photo Downloader from mybrightday

This is a browser script that downloads last month's photo attachments from the [My Bright Day](https://mybrightday.brighthorizons.com/) website. My Bright Day website, while it uses Tadpoles as the backend, is hosted differently by BrightHorizons. It is evidenced by its log-in via Bright Horizon's [Family Information Center](https://familyinfocenter.brighthorizons.com/). So rather than trying to figure out how to sign in to My Bright Day as a standalone app, this script runs in the browser with My Bright Day already open, and uses the cookie to access photos.

After logging into My Bright Day, open the browser console (right click on page and select "Inspect"), go to the "Console" tab, paste the entire script at the prompt, and hit "Enter". If you're running scripts in browswer for the first time, it will prompt you to acknowledge it. Simply acknowledge and paste the script again, and it should work. The script will download each photo as a separate download job, so you will need to allow this webpage to download multiple attachments. Then just wait for it to finish, as it downloads photos sequentially (to avoid being detected by the server).

This script is developed for Google Chrome on MacOS, and has not been tested in other browswers.
