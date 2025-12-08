WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.060 --> 00:00:00.340
All right,

00:00:00.340 --> 00:00:02.500
so one really quick update on the browser

00:00:02.500 --> 00:00:03.580
rendering side of things.

00:00:04.100 --> 00:00:04.500
I,

00:00:04.500 --> 00:00:07.500
we're continuously getting this unknown status and

00:00:07.500 --> 00:00:09.060
when you look at the HTML of the page,

00:00:09.140 --> 00:00:11.460
it's not actually pulling that full,

00:00:11.700 --> 00:00:12.179
you know,

00:00:12.179 --> 00:00:14.140
like the full web page and actually showing if

00:00:14.140 --> 00:00:15.460
it's like available or not.

00:00:15.460 --> 00:00:18.020
And I was kind of like trying to debug that

00:00:18.020 --> 00:00:18.340
process,

00:00:18.340 --> 00:00:20.060
but then I realized because you're browser

00:00:20.060 --> 00:00:21.380
rendering using Puppeteer,

00:00:21.380 --> 00:00:23.310
you can also take screenshots of,

00:00:23.540 --> 00:00:25.420
of the output of a browser render,

00:00:25.420 --> 00:00:26.460
which is actually pretty cool.

00:00:26.460 --> 00:00:28.740
So I thought to add this really quick and then you

00:00:28.740 --> 00:00:30.180
can also add this on your end if you'd like.

00:00:30.180 --> 00:00:31.300
But it's not necessary,

00:00:31.300 --> 00:00:32.500
it's not necessary for this course,

00:00:32.500 --> 00:00:34.340
but just kind of wanted to walk you through what I

00:00:34.340 --> 00:00:34.740
did here.

00:00:34.740 --> 00:00:36.660
So basically this is our

00:00:37.700 --> 00:00:39.780
this is our browser rendering logic.

00:00:39.860 --> 00:00:41.660
And before we were just like loading the page,

00:00:41.660 --> 00:00:42.500
getting idle,

00:00:42.500 --> 00:00:44.580
getting some information from the page here and

00:00:44.580 --> 00:00:45.380
then returning it,

00:00:45.540 --> 00:00:47.940
I also added these two lines of code which is

00:00:47.940 --> 00:00:49.860
basically what we're saying is we're going to take

00:00:49.860 --> 00:00:50.740
a screenshot

00:00:51.310 --> 00:00:52.030
of the,

00:00:52.180 --> 00:00:54.650
we're going to take a screenshot of the page after

00:00:54.650 --> 00:00:55.450
it's loaded.

00:00:55.930 --> 00:00:58.930
And then what I'm doing here is I'm basically like

00:00:58.930 --> 00:01:00.810
saving it as a base 64,

00:01:01.140 --> 00:01:01.730
encoding

00:01:02.130 --> 00:01:04.450
and you can just create a data URL with that

00:01:04.450 --> 00:01:05.490
base64 encoding,

00:01:05.490 --> 00:01:07.490
which is just like a very

00:01:07.810 --> 00:01:10.720
long encoded string that represents an image.

00:01:10.910 --> 00:01:12.390
it's kind of a lower level concept,

00:01:12.390 --> 00:01:13.390
but it's also pretty cool.

00:01:13.390 --> 00:01:14.910
So what I've done here is I've

00:01:15.020 --> 00:01:18.090
I'm returning the screenshot data URL and then

00:01:18.090 --> 00:01:19.383
inside of our workflow,

00:01:19.416 --> 00:01:21.316
the very last step where we're saving data into

00:01:21.316 --> 00:01:21.796
R2,

00:01:22.116 --> 00:01:24.276
before we were just taking the HTML and the body.

00:01:24.596 --> 00:01:27.156
But what I'm also doing is I'm also basically

00:01:27.156 --> 00:01:29.676
creating a path specifically for screenshots and

00:01:29.676 --> 00:01:30.956
this is going to really help debug because

00:01:30.956 --> 00:01:31.516
sometimes you know,

00:01:31.516 --> 00:01:33.916
you get like I am a robot pop up and you're not

00:01:33.916 --> 00:01:34.916
able to pass through.

00:01:35.316 --> 00:01:36.916
Most websites are doing that these days.

00:01:36.916 --> 00:01:37.736
they're kind of protected.

00:01:37.736 --> 00:01:39.696
So like a product like this would be actually

00:01:39.696 --> 00:01:39.936
very,

00:01:39.936 --> 00:01:42.056
very hard to build in production just because,

00:01:42.056 --> 00:01:42.496
you know,

00:01:42.496 --> 00:01:42.896
it's

00:01:43.466 --> 00:01:44.527
the type of scenario

00:01:44.793 --> 00:01:47.793
where most companies are now kind of like getting

00:01:47.793 --> 00:01:48.263
much better at

00:01:48.313 --> 00:01:49.553
protecting their websites from bots.

00:01:49.553 --> 00:01:51.993
And honestly in production selling a product like

00:01:51.993 --> 00:01:52.273
this,

00:01:52.433 --> 00:01:52.993
you know,

00:01:53.073 --> 00:01:54.873
I don't necessarily know the legalities around

00:01:54.873 --> 00:01:55.473
scraping

00:01:55.483 --> 00:01:56.073
websites.

00:01:56.073 --> 00:01:57.512
So there is kind of that caveat.

00:01:57.512 --> 00:02:00.153
But what we do here is we take the screenshot,

00:02:00.483 --> 00:02:01.733
that big data URL,

00:02:01.893 --> 00:02:04.733
I'm just kind of parsing out this encoding of that

00:02:04.733 --> 00:02:05.653
base 64,

00:02:05.733 --> 00:02:08.613
so technically we probably don't need to even

00:02:08.613 --> 00:02:10.373
include it in that string output.

00:02:11.443 --> 00:02:12.563
and then I am

00:02:13.123 --> 00:02:13.143
creating,

00:02:13.473 --> 00:02:16.913
a buffer from that base64 encoded version,

00:02:16.913 --> 00:02:18.353
like representation of the image.

00:02:18.513 --> 00:02:20.833
And then we're just simply uploading it to

00:02:21.473 --> 00:02:21.873
the.

00:02:21.953 --> 00:02:23.313
We're uploading it to R2.

00:02:23.313 --> 00:02:23.633
Now,

00:02:23.633 --> 00:02:24.993
from the R2 side of things,

00:02:25.153 --> 00:02:28.073
what we can do is we can go ahead and look at the

00:02:28.073 --> 00:02:28.553
output.

00:02:28.553 --> 00:02:28.953
So I,

00:02:28.953 --> 00:02:30.393
I did run this workflow one time.

00:02:30.393 --> 00:02:31.793
I'm not going to kind of waste your time and go

00:02:31.793 --> 00:02:33.473
through that process because you already know how.

00:02:33.633 --> 00:02:35.473
But if we go to the screenshots and we see the

00:02:35.473 --> 00:02:36.673
output of that screenshot,

00:02:36.753 --> 00:02:37.913
what we can see is like,

00:02:37.913 --> 00:02:39.713
it's actually throwing a network idle issue.

00:02:40.033 --> 00:02:41.853
basically I think what they're doing on their end

00:02:41.853 --> 00:02:43.673
is they're trying to det if it is a bot and then

00:02:43.673 --> 00:02:45.433
they throw this error and they want to see if

00:02:45.433 --> 00:02:45.953
you'll actually

00:02:46.273 --> 00:02:46.913
reload.

00:02:47.463 --> 00:02:49.303
so I think in the world of AI,

00:02:49.303 --> 00:02:51.303
you could probably programmatically build out

00:02:51.303 --> 00:02:52.383
workflows where like,

00:02:52.383 --> 00:02:55.423
you take the context of the page and then AI is

00:02:55.423 --> 00:02:55.583
like,

00:02:55.583 --> 00:02:55.903
oh,

00:02:55.903 --> 00:02:57.703
it looks like there's a button to try to reload.

00:02:57.703 --> 00:02:58.903
I'm going to try to reload that.

00:02:58.903 --> 00:02:59.103
So,

00:02:59.103 --> 00:02:59.263
like,

00:02:59.263 --> 00:03:01.383
this whole agentic space that we're in,

00:03:01.383 --> 00:03:02.133
there's a lot of like,

00:03:02.133 --> 00:03:03.733
feasible things that you could build to like,

00:03:03.733 --> 00:03:04.093
you know,

00:03:04.093 --> 00:03:05.093
in a very intelligent way,

00:03:05.093 --> 00:03:05.813
try to like,

00:03:06.053 --> 00:03:07.653
get the information that you want on the page.

00:03:07.653 --> 00:03:09.253
That's what a lot of these AI providers are

00:03:09.253 --> 00:03:09.813
already doing.

00:03:10.533 --> 00:03:11.133
so for now,

00:03:11.133 --> 00:03:11.453
like,

00:03:11.453 --> 00:03:11.967
just note

00:03:12.014 --> 00:03:12.364
this.

00:03:12.551 --> 00:03:14.110
the reason why we're getting the unknown status is

00:03:14.110 --> 00:03:16.910
because AliExpress is giving this error from our

00:03:16.910 --> 00:03:17.910
browser renderer.

00:03:17.990 --> 00:03:18.320
So,

00:03:18.320 --> 00:03:18.710
you might,

00:03:18.710 --> 00:03:19.870
you may or may not get this,

00:03:19.870 --> 00:03:22.070
but what is cool now is in our pipeline.

00:03:22.070 --> 00:03:24.030
We now have a way of actually taking a screenshot

00:03:24.030 --> 00:03:25.990
of that image so we can actually visually debug

00:03:25.990 --> 00:03:28.070
what is happening behind the scenes in that

00:03:28.070 --> 00:03:28.734
browser rendering.

