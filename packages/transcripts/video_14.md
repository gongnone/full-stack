WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.087 --> 00:00:00.487
All right,

00:00:00.567 --> 00:00:02.407
so now that we have our

00:00:02.967 --> 00:00:05.887
Hono application wired into our cloudflare worker

00:00:05.887 --> 00:00:07.207
fetch entry point right here,

00:00:07.527 --> 00:00:09.807
let's go ahead and understand the request object

00:00:09.807 --> 00:00:11.806
and the headers that we have access to that will

00:00:11.806 --> 00:00:14.127
make this entire dynamic routing system actually

00:00:14.127 --> 00:00:14.807
come to life.

00:00:15.047 --> 00:00:17.447
So first thing that I want to do is I want to take

00:00:17.447 --> 00:00:19.327
a look at the context and then I just want to see

00:00:19.327 --> 00:00:19.527
like,

00:00:19.527 --> 00:00:19.847
okay,

00:00:19.847 --> 00:00:21.517
what properties are available to us.

00:00:21.697 --> 00:00:23.177
there's a whole bunch of different things here

00:00:23.177 --> 00:00:25.017
that are useful and we're going to make use of

00:00:25.017 --> 00:00:25.497
some of them.

00:00:25.497 --> 00:00:27.057
But the one that is

00:00:27.437 --> 00:00:28.397
going to actually like,

00:00:28.397 --> 00:00:31.397
power this dynamic routing system is actually the

00:00:31.397 --> 00:00:32.397
headers of the request.

00:00:32.637 --> 00:00:33.037
So,

00:00:33.207 --> 00:00:35.337
inside of the context you can see the rec,

00:00:35.417 --> 00:00:36.217
which is the

00:00:36.617 --> 00:00:39.097
request provided by the cloudflare worker.

00:00:39.097 --> 00:00:39.337
Now,

00:00:39.337 --> 00:00:42.297
Hono does some pre processing to the request.

00:00:42.617 --> 00:00:46.257
So the request at this layer of our application is

00:00:46.257 --> 00:00:48.777
actually not the same as the request here.

00:00:48.907 --> 00:00:50.517
they actually have slightly different properties.

00:00:50.517 --> 00:00:53.597
Hono attaches a few different helper methods to

00:00:53.597 --> 00:00:53.947
make,

00:00:53.947 --> 00:00:55.927
working with like cookies and headers really

00:00:55.927 --> 00:00:56.327
simple.

00:00:56.817 --> 00:00:57.817
But for our use case,

00:00:57.817 --> 00:00:59.537
what we're going to want to do is like,

00:00:59.537 --> 00:01:00.977
we're going to want to look at,

00:01:02.437 --> 00:01:02.997
raw.

00:01:03.157 --> 00:01:03.557
So

00:01:03.877 --> 00:01:06.877
Hono also provides like this RAW object,

00:01:06.877 --> 00:01:08.597
which is the RAW request,

00:01:08.597 --> 00:01:12.117
meaning the actual like request that was provided

00:01:12.357 --> 00:01:14.677
inside of this Hono fetch handler.

00:01:14.677 --> 00:01:17.157
So from the cloudflare request we have our

00:01:17.157 --> 00:01:18.437
standard request object,

00:01:18.997 --> 00:01:19.397
and

00:01:19.977 --> 00:01:21.797
that request object is being passed into Hono.

00:01:21.797 --> 00:01:23.837
And Hono does a little bit of processing and gives

00:01:23.837 --> 00:01:26.317
us access to APIs and methods that make working

00:01:26.317 --> 00:01:27.127
with the request easy,

00:01:27.277 --> 00:01:27.717
easier.

00:01:27.717 --> 00:01:28.077
But

00:01:28.110 --> 00:01:31.606
if we want RAW access to the original request,

00:01:31.606 --> 00:01:33.766
you can do so by accessing RAW here.

00:01:34.166 --> 00:01:36.246
and then inside of raw you're going to see that we

00:01:36.246 --> 00:01:36.886
have headers.

00:01:36.966 --> 00:01:38.086
Now these headers,

00:01:38.086 --> 00:01:39.846
if we just JSON parse these headers,

00:01:39.846 --> 00:01:40.886
you can see what's in here.

00:01:45.280 --> 00:01:46.720
So we're just going to go ahead and,

00:01:46.960 --> 00:01:48.250
stringify the headers.

00:01:48.490 --> 00:01:50.090
We can hit our

00:01:51.110 --> 00:01:51.670
route here.

00:01:52.150 --> 00:01:54.910
And you can see there's not any useful headers in

00:01:54.910 --> 00:01:55.350
this information,

00:01:55.430 --> 00:01:56.870
which is okay because,

00:01:57.460 --> 00:02:00.510
the Cloudflare specific environments are actually

00:02:00.670 --> 00:02:01.070
available

00:02:01.870 --> 00:02:04.270
under this CF property.

00:02:04.270 --> 00:02:04.550
Now,

00:02:04.550 --> 00:02:05.830
CF stands for Cloudflare,

00:02:05.830 --> 00:02:08.310
and this is the additional header information that

00:02:08.310 --> 00:02:09.310
is actually like

00:02:09.690 --> 00:02:12.330
attached from Cloudflare servers when a request is

00:02:12.330 --> 00:02:12.650
made.

00:02:12.810 --> 00:02:15.370
So if we go ahead and we hit this endpoint again,

00:02:15.544 --> 00:02:16.864
what you're going to see is we actually have a

00:02:16.864 --> 00:02:18.744
whole bunch of useful information here.

00:02:18.984 --> 00:02:19.384
Now,

00:02:19.554 --> 00:02:21.184
this is going to be kind of hard to read,

00:02:21.424 --> 00:02:23.864
so we can you know what we can do is we can copy

00:02:23.864 --> 00:02:25.744
it just to get a better understanding of it.

00:02:25.744 --> 00:02:27.904
We could just Google JSON parser

00:02:28.154 --> 00:02:29.738
and we have this JSON converter.

00:02:30.188 --> 00:02:32.468
looks like Claude AI actually is having an

00:02:32.468 --> 00:02:33.988
advertisement on jsonconverter.

00:02:33.988 --> 00:02:34.688
That's kind of funny.

00:02:34.688 --> 00:02:37.568
JSON formatter.org is a tried and true

00:02:38.128 --> 00:02:38.768
website for this.

00:02:38.768 --> 00:02:39.168
So

00:02:39.588 --> 00:02:41.808
what you can see here is we have a whole bunch of

00:02:41.808 --> 00:02:44.648
diff of useful information that is provided inside

00:02:44.648 --> 00:02:45.128
of the

00:02:45.208 --> 00:02:47.948
Cloudflare object inside of a request.

00:02:48.668 --> 00:02:49.068
And

00:02:49.398 --> 00:02:52.038
specifically what we're looking at is kind of like

00:02:52.038 --> 00:02:53.638
the location based stuff.

00:02:53.638 --> 00:02:54.678
So I'm currently

00:02:55.078 --> 00:02:55.878
on a trip

00:02:56.158 --> 00:02:56.898
in Washington.

00:02:56.898 --> 00:02:59.298
So you can see that the closest Cloudflare

00:02:59.378 --> 00:03:00.018
location,

00:03:00.178 --> 00:03:01.918
so the server that is actually handling the

00:03:01.918 --> 00:03:04.438
request managed by Cloudflare is located in

00:03:04.438 --> 00:03:05.078
Seattle.

00:03:05.367 --> 00:03:07.047
gives us information about the time zone

00:03:07.367 --> 00:03:08.807
and it gives us the

00:03:09.437 --> 00:03:12.517
the nearest latitude and longitude of the server

00:03:12.517 --> 00:03:13.917
that is making that request.

00:03:14.607 --> 00:03:15.097
and then

00:03:15.657 --> 00:03:17.857
you get some additional information that's really

00:03:17.857 --> 00:03:19.257
useful like the postal code,

00:03:20.027 --> 00:03:20.667
the city,

00:03:21.387 --> 00:03:21.787
some,

00:03:21.867 --> 00:03:24.147
you get access to the actual like Internet

00:03:24.147 --> 00:03:25.147
provider as well.

00:03:25.147 --> 00:03:27.707
So these are all super useful things but a region

00:03:27.707 --> 00:03:28.507
code as well.

00:03:28.507 --> 00:03:30.777
Now the thing that we are going to be

00:03:30.777 --> 00:03:33.247
most interested in is actually the country.

00:03:34.643 --> 00:03:37.443
you can see here that we have this flag country.

00:03:37.683 --> 00:03:40.563
There's also this is EU country which I'm assuming

00:03:40.563 --> 00:03:43.963
they're using for like GDPR compliance to

00:03:43.963 --> 00:03:45.363
basically know like oh,

00:03:45.643 --> 00:03:47.923
requests from the specific region have specific

00:03:48.083 --> 00:03:49.123
compliance related things.

00:03:49.123 --> 00:03:51.843
So they have a very specific is EU country there

00:03:51.843 --> 00:03:52.883
which is kind of interesting.

00:03:52.883 --> 00:03:55.323
So if you have a very sensitive application where

00:03:55.323 --> 00:03:57.883
you're really worried about GDPR compliance for a

00:03:57.883 --> 00:03:58.643
given use case,

00:03:58.643 --> 00:04:00.283
I think that's something that you could also latch

00:04:00.283 --> 00:04:00.643
onto.

00:04:00.643 --> 00:04:02.763
But what we care about here is we care about the

00:04:02.763 --> 00:04:03.043
country

00:04:03.763 --> 00:04:05.803
and we also care about the latitude and longitude.

00:04:05.803 --> 00:04:07.843
This is information that we're going to save when

00:04:07.843 --> 00:04:10.403
we receive a request to actually determine our

00:04:10.403 --> 00:04:11.363
routing logic.

00:04:11.719 --> 00:04:12.999
So heading back to our

00:04:13.459 --> 00:04:14.859
heading back to our app,

00:04:14.859 --> 00:04:16.019
let's just go ahead and say

00:04:16.788 --> 00:04:17.189
const

00:04:18.229 --> 00:04:19.429
country equals

00:04:19.989 --> 00:04:21.114
c rec.raw.cf

00:04:21.114 --> 00:04:25.540
rec.raw.cf and then

00:04:27.610 --> 00:04:28.650
we can say country.

00:04:29.050 --> 00:04:30.030
So it looks like

00:04:30.050 --> 00:04:32.530
CF object is an optional object and then

00:04:32.930 --> 00:04:34.210
attached to that is country.

00:04:34.290 --> 00:04:35.250
So this could be

00:04:35.950 --> 00:04:38.990
this is of type undefined or of type unknown.

00:04:38.990 --> 00:04:41.670
But in our use case it's going to either be a

00:04:41.670 --> 00:04:43.310
string or it's going to be undefined.

00:04:43.390 --> 00:04:43.790
Now

00:04:44.460 --> 00:04:46.460
I think what we want to do is we can just

00:04:46.460 --> 00:04:48.140
basically we can go ahead and say

00:04:50.140 --> 00:04:50.540
const

00:04:51.100 --> 00:04:54.300
CF is going to equal CF just so we don't have to

00:04:54.300 --> 00:04:55.900
type this a million different times.

00:04:57.084 --> 00:04:58.444
And let's do the same for

00:04:59.164 --> 00:05:03.324
latitude and longitude so c.um

00:05:03.964 --> 00:05:05.258
or cf.

00:05:05.658 --> 00:05:07.018
Latitude and

00:05:07.498 --> 00:05:08.213
constitute.

00:05:08.213 --> 00:05:08.569
constitute.

00:05:08.569 --> 00:05:10.455
constitute.

00:05:10.855 --> 00:05:13.135
Now I'm just going to go ahead in here and I'm

00:05:13.135 --> 00:05:14.135
going to return this information.

00:05:14.375 --> 00:05:15.810
So we can basically say

00:05:16.262 --> 00:05:16.502
country

00:05:17.416 --> 00:05:19.608
lat and longitude.

00:05:19.608 --> 00:05:21.175
We can head back to our

00:05:21.815 --> 00:05:23.015
worker that is

00:05:23.185 --> 00:05:24.375
we head back to the browser,

00:05:24.455 --> 00:05:26.295
hit that worker and you can see we actually are

00:05:26.295 --> 00:05:27.255
able to grab that information.

00:05:27.575 --> 00:05:30.535
So the next step here that now that we have access

00:05:30.615 --> 00:05:31.495
to the

00:05:31.885 --> 00:05:32.765
cloudflare

00:05:33.165 --> 00:05:33.805
specific

00:05:34.475 --> 00:05:35.093
tags

00:05:35.177 --> 00:05:37.457
is to actually build out the conditional routing

00:05:37.457 --> 00:05:37.897
logic.

00:05:37.897 --> 00:05:38.697
So we're going to

00:05:38.857 --> 00:05:41.677
introduce a database lookup here but we're also to

00:05:41.677 --> 00:05:44.517
speed things up we're also going to add a KV cache

00:05:44.517 --> 00:05:47.157
just so we can have really instantaneous

00:05:47.157 --> 00:05:48.077
redirects.

00:05:48.077 --> 00:05:49.757
So let's go ahead and start that process.

