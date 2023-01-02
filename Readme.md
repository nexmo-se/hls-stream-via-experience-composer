**HLS stream via Experience Composer**

Shows how to use the experience composer and an HLS client to stream HLS stream into a session

The file **hlsplayer.ejs** is an example HLS client using [videoJS](https://videojs.com/).

It this demo, an experience composer instant points to this client's URL and streams the rendered page to the current session.

You can even use the c HLS client as a stand alone page by going to **/hlsplayer** and using **"source"** query parameter to point to the HLS URL.
Example: 

    https://<URL>/hlsplayer?source=https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8`

To change the HLS stream in real time, you can call **/change_source** and use the **source** query to point to the HLS URL.
Example:

    https://<URL>/change_source?source=https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8`

Note that the Experience Composer must be enabled for your account to use the demo.
You can check [Experience Composer | Vonage Video API Developer (tokbox.com)](https://tokbox.com/developer/guides/experience-composer/) to learn how to do that.
