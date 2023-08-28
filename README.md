# master
In-browser loudness normalization

Drop an audio file to normalize it using Integrated Loudness and TruePeak measurements. All in-browser, no leaky leaky of personal data.

## IAQ (Infrequently Asked Questions)

### Why did you build this?

For the challenge, and because it should exist.

### How is this done?

Using [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for analysis and amplification. the `loudnorm` dynamic mode is *not* used. If you want to see it, add a PR or file an issue.

### Is any data uploaded anywhere?

No. Your browser does all the work.

### How does it work, exactly?

Two passes. First pass measures loudness, second pass amplifies.

### How does it ensure that the I and TP values are met?

It doesn't. It ensures that neither value is exceeded. If your content has ridiculously high Integrated Loudness, the TP value will be below its limit, and vice versa. This is not an "automatic mastering plugin," it just does some analysis. And math. Not much math, tho.

### Can you add feature X?

Open an issue and I'll have a look.

### Do you make music?

Yep. [Soundcloud link](soundcloud.com/teetow)
