WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.030 --> 00:00:00.390
all right,

00:00:00.390 --> 00:00:01.950
so as we saw from the last video,

00:00:02.110 --> 00:00:04.390
this gitlink is calling our database and is

00:00:04.390 --> 00:00:05.710
getting the link configuration.

00:00:05.790 --> 00:00:07.870
And that was pretty snappy when I was making a

00:00:07.870 --> 00:00:09.030
request from the United States,

00:00:09.030 --> 00:00:12.470
but it was a bit slower when we were on a VPN in

00:00:12.470 --> 00:00:14.110
Malaysia and made that same request.

00:00:14.590 --> 00:00:17.150
Now the reason why is because our D1 database is

00:00:17.150 --> 00:00:18.350
sitting in the United States.

00:00:18.510 --> 00:00:21.110
So the network travel from Malaysia or Asia or

00:00:21.110 --> 00:00:23.550
Europe to the database and back is going to be,

00:00:23.910 --> 00:00:25.470
there's going to be a little bit of extra latency

00:00:25.470 --> 00:00:25.750
there.

00:00:25.750 --> 00:00:29.270
Now we can actually sort this type of issue out on

00:00:29.270 --> 00:00:30.460
top of Cloudflare's

00:00:30.500 --> 00:00:33.020
data ecosystem with a Cloudflare KV,

00:00:33.020 --> 00:00:35.140
because Cloudflare KVs are just a very,

00:00:35.140 --> 00:00:37.060
very simple key value pair cache,

00:00:37.430 --> 00:00:38.840
that is eventually consistent.

00:00:38.840 --> 00:00:41.080
And I actually have a pretty good video on my

00:00:41.080 --> 00:00:42.640
YouTube channel where we explain

00:00:42.800 --> 00:00:45.360
when to use eventually consistent caching.

00:00:45.680 --> 00:00:48.320
And this is one of the use cases where like

00:00:48.720 --> 00:00:51.600
this would actually make sense because essentially

00:00:51.980 --> 00:00:54.400
we're not updating the data frequently.

00:00:54.440 --> 00:00:56.280
sometimes with eventually consistent caching

00:00:56.280 --> 00:00:59.640
you'll write data into a key value store and that

00:00:59.640 --> 00:01:01.800
data is going to be replicated across servers

00:01:01.800 --> 00:01:04.720
around the world and it might take a few seconds

00:01:04.720 --> 00:01:05.480
for it to actually

00:01:05.960 --> 00:01:06.840
make it to

00:01:07.020 --> 00:01:08.700
a server that's close to your users.

00:01:08.700 --> 00:01:09.060
And

00:01:09.480 --> 00:01:10.080
for like,

00:01:10.160 --> 00:01:13.640
types of operations where you need your writes to

00:01:13.640 --> 00:01:15.170
be immediately ready,

00:01:15.320 --> 00:01:16.120
that's not going to work.

00:01:16.220 --> 00:01:18.640
and also if you're updating data frequently for

00:01:18.640 --> 00:01:19.360
the same key,

00:01:19.360 --> 00:01:20.520
that's also not going to work.

00:01:20.520 --> 00:01:21.640
So I would encourage you,

00:01:21.640 --> 00:01:22.320
if you're interested,

00:01:22.320 --> 00:01:24.640
to kind of like learn the nuances to watch this

00:01:24.640 --> 00:01:24.920
video.

00:01:25.160 --> 00:01:26.520
It goes really in depth.

00:01:26.520 --> 00:01:26.920
But

00:01:27.240 --> 00:01:28.100
without further ado,

00:01:28.100 --> 00:01:31.100
let's go ahead and implement a KV store on top of

00:01:31.100 --> 00:01:31.380
this,

00:01:32.120 --> 00:01:34.880
dynamic routing logic to speed things up and make

00:01:34.880 --> 00:01:36.200
it globally distributed.

00:01:36.280 --> 00:01:36.680
So

00:01:37.080 --> 00:01:39.240
we can head over to the Cloudflare dashboard

00:01:39.560 --> 00:01:39.880
and,

00:01:40.030 --> 00:01:41.150
and like always,

00:01:41.230 --> 00:01:41.920
this type of

00:01:41.920 --> 00:01:44.770
workflow you could also do from the Wrangler cli.

00:01:44.770 --> 00:01:47.210
But I do find working inside of the dashboard to

00:01:47.210 --> 00:01:48.240
be pretty simple.

00:01:48.240 --> 00:01:50.410
and I do think that's where most people gravitate

00:01:50.410 --> 00:01:50.850
towards.

00:01:51.010 --> 00:01:54.210
So what we can do is we can head over to our

00:01:55.510 --> 00:01:56.710
storage databases

00:01:57.190 --> 00:01:59.710
and previously we created a SQL D1 database.

00:01:59.710 --> 00:02:01.110
But what we're going to do is we're going to

00:02:01.110 --> 00:02:02.910
create a key value pair.

00:02:02.910 --> 00:02:05.110
Now this is also part of their free offering.

00:02:05.110 --> 00:02:05.510
So

00:02:06.010 --> 00:02:07.690
I have a test cache created.

00:02:07.690 --> 00:02:09.570
But what I'm going to do is I'm going to say this

00:02:09.570 --> 00:02:10.650
is going to be

00:02:12.490 --> 00:02:13.130
smart

00:02:13.930 --> 00:02:14.650
links

00:02:15.450 --> 00:02:16.090
cache

00:02:16.410 --> 00:02:16.970
stage.

00:02:17.050 --> 00:02:17.770
Now remember,

00:02:17.770 --> 00:02:18.170
I'm

00:02:18.600 --> 00:02:20.720
having a suffix of stage for all of these

00:02:20.720 --> 00:02:22.880
resources because later on the course we're going

00:02:22.880 --> 00:02:25.280
to actually create a stage environment and a

00:02:25.280 --> 00:02:27.160
production environment so we can test things

00:02:27.880 --> 00:02:28.980
in a more like

00:02:29.230 --> 00:02:31.150
professional and enterprise way.

00:02:31.230 --> 00:02:33.030
So I'm going to go ahead and create that key value

00:02:33.030 --> 00:02:33.470
pair.

00:02:33.843 --> 00:02:35.176
I'll copy the ID right now

00:02:35.736 --> 00:02:37.896
we'll head over to our wrangler

00:02:38.396 --> 00:02:38.956
JSON.

00:02:39.276 --> 00:02:41.676
And remember this is inside of our data service

00:02:41.756 --> 00:02:42.716
package or

00:02:42.766 --> 00:02:44.396
application because that's where we're working

00:02:44.396 --> 00:02:44.916
right now.

00:02:45.476 --> 00:02:48.276
And I will go ahead and I will say

00:02:49.606 --> 00:02:50.886
KV namespaces

00:02:51.686 --> 00:02:54.166
is going to be part so the binding,

00:02:54.166 --> 00:02:55.526
we'll just call this cache

00:02:56.786 --> 00:02:58.306
and it's going to be

00:02:59.666 --> 00:03:02.306
the ID we'll pass in the ID and then

00:03:02.626 --> 00:03:06.066
we will also say experimental remote equals true

00:03:06.226 --> 00:03:08.146
just so we can access the actual

00:03:08.616 --> 00:03:10.916
KV store that is hosted by cloudflare.

00:03:11.316 --> 00:03:13.636
Then we're going to say PNPM run CF

00:03:13.710 --> 00:03:14.430
type gen.

00:03:14.670 --> 00:03:16.830
Make sure you are in your data service

00:03:17.070 --> 00:03:18.030
directory here.

00:03:18.990 --> 00:03:22.510
And now we have this cache namespace.

00:03:22.590 --> 00:03:22.990
So

00:03:23.560 --> 00:03:26.251
if we head back over to our app ts,

00:03:26.251 --> 00:03:28.598
what you're going to notice is we have this

00:03:28.918 --> 00:03:30.118
C EMV

00:03:30.438 --> 00:03:31.718
cache is now available.

00:03:31.733 --> 00:03:34.074
Now the order of operation here is actually going

00:03:34.074 --> 00:03:35.074
to be first,

00:03:35.074 --> 00:03:36.114
when we get a request,

00:03:36.114 --> 00:03:38.474
we're going to check our key value pair to see if

00:03:38.474 --> 00:03:40.514
the data is stored in the cache.

00:03:40.754 --> 00:03:41.714
And if it's not,

00:03:41.794 --> 00:03:43.554
we're going to fall back to our database call.

00:03:43.874 --> 00:03:47.194
And then if the database call renders or returns

00:03:47.194 --> 00:03:47.634
some data,

00:03:48.034 --> 00:03:52.034
we'll store that in our KB cache and then we will

00:03:52.364 --> 00:03:53.814
continue the flow as follows.

00:03:53.814 --> 00:03:54.174
So

00:03:54.574 --> 00:03:56.454
this type of conditional logic is something where

00:03:56.454 --> 00:03:58.614
I usually don't like to put it inside of the route

00:03:58.614 --> 00:04:00.494
just because the route becomes kind of bloated.

00:04:00.494 --> 00:04:03.094
This is about as complex as I want this route to

00:04:03.094 --> 00:04:03.374
be.

00:04:04.014 --> 00:04:06.694
So we can head over to our helpers and we'll go to

00:04:06.694 --> 00:04:07.614
our route ops.

00:04:08.094 --> 00:04:10.653
And first off I'm going to go ahead and I'm going

00:04:10.653 --> 00:04:12.014
to create a method called

00:04:13.434 --> 00:04:14.974
get link info from kb.

00:04:14.974 --> 00:04:16.574
Now this is going to take our

00:04:16.854 --> 00:04:17.714
Cloudflare environment

00:04:18.194 --> 00:04:20.754
and it's going to take a id and that's basically

00:04:20.754 --> 00:04:22.634
going to be like the key that we look something up

00:04:22.634 --> 00:04:22.914
on.

00:04:23.384 --> 00:04:25.144
Now what we can do is we can say const

00:04:25.704 --> 00:04:26.904
link info

00:04:28.104 --> 00:04:28.744
equals

00:04:29.944 --> 00:04:30.584
await

00:04:30.689 --> 00:04:32.209
EMV cache

00:04:32.529 --> 00:04:32.929
get

00:04:33.329 --> 00:04:34.689
and we're going to pass in that id.

00:04:35.809 --> 00:04:37.969
Now if it is not found,

00:04:38.529 --> 00:04:39.889
we can just return null.

00:04:41.195 --> 00:04:42.875
And then what we're going to want to do is we're

00:04:42.875 --> 00:04:44.635
going to add some try catch logic here.

00:04:44.955 --> 00:04:46.275
So we could do try catch.

00:04:46.275 --> 00:04:47.445
We could also do safe parser.

00:04:47.475 --> 00:04:49.595
it doesn't really matter for this use case,

00:04:49.595 --> 00:04:50.795
but if you remember,

00:04:50.795 --> 00:04:53.395
we actually have a Zod schema for our

00:04:53.875 --> 00:04:55.845
link data that's stored in the database.

00:04:55.845 --> 00:04:56.175
this is,

00:04:56.175 --> 00:04:57.855
you're going to notice we're going to be importing

00:04:57.855 --> 00:04:59.775
these schemas from our package,

00:04:59.985 --> 00:05:00.775
inside of our,

00:05:00.775 --> 00:05:03.095
from our monorepo inside of our data ops package,

00:05:03.335 --> 00:05:04.775
just to keep things really clean,

00:05:04.775 --> 00:05:06.615
make sure everything's super type safe and we're

00:05:06.615 --> 00:05:08.655
not running into any issues where like a type is

00:05:08.655 --> 00:05:09.015
wrong.

00:05:09.335 --> 00:05:11.695
Essentially what's happening here is the data

00:05:11.695 --> 00:05:13.495
that's returned is a string.

00:05:13.985 --> 00:05:14.225
And

00:05:14.625 --> 00:05:15.945
what we're going to do is we're going to parse

00:05:15.945 --> 00:05:16.465
that string,

00:05:16.545 --> 00:05:18.785
put it in a JSON format if it's found,

00:05:19.025 --> 00:05:20.785
and then we're going to run it through a,

00:05:21.065 --> 00:05:24.585
Zod parser just to make sure this is fully type

00:05:24.585 --> 00:05:25.025
safe.

00:05:25.025 --> 00:05:27.585
So this method can either return null or it can

00:05:27.585 --> 00:05:29.225
return the data that we expect,

00:05:29.765 --> 00:05:30.345
in a very

00:05:30.745 --> 00:05:31.585
type safe

00:05:31.785 --> 00:05:33.785
link schema format.

00:05:34.345 --> 00:05:34.985
Okay,

00:05:34.985 --> 00:05:37.745
so then what I'm going to basically do is I'm

00:05:37.745 --> 00:05:38.905
going to say let's

00:05:39.815 --> 00:05:40.055
create

00:05:40.375 --> 00:05:42.255
Another method and this is going to be the one

00:05:42.255 --> 00:05:43.735
that we actually use in our application.

00:05:44.135 --> 00:05:44.625
in our

00:05:44.625 --> 00:05:46.085
route called get

00:05:46.805 --> 00:05:46.825
georouting

00:05:47.545 --> 00:05:48.425
destinations.

00:05:48.745 --> 00:05:51.625
This is also going to be taking an ENB and an ID

00:05:52.105 --> 00:05:54.865
and then what we're going to want to do is inside

00:05:54.865 --> 00:05:55.385
of app

00:05:55.525 --> 00:05:57.665
we have this code here where we're calling our

00:05:57.665 --> 00:05:58.265
database.

00:05:58.665 --> 00:06:00.705
All of this logic is actually going to be moved

00:06:00.705 --> 00:06:02.265
into this route ops

00:06:02.345 --> 00:06:04.135
inside of this git routing destination.

00:06:04.215 --> 00:06:06.415
So the very first thing that we are going to do is

00:06:06.415 --> 00:06:07.335
we are going to say

00:06:07.815 --> 00:06:08.375
let's

00:06:10.017 --> 00:06:13.417
let's get the information from our get link info

00:06:13.417 --> 00:06:13.939
from KV

00:06:13.939 --> 00:06:15.776
and if it's not found or if it is found

00:06:16.096 --> 00:06:17.676
let's just go ahead and return that

00:06:17.676 --> 00:06:18.692
and if it's not found

00:06:19.341 --> 00:06:20.621
let's go to our database

00:06:21.501 --> 00:06:22.341
and let's look

00:06:22.381 --> 00:06:22.781
our,

00:06:23.421 --> 00:06:26.181
let's look up the link info from DB calling the

00:06:26.181 --> 00:06:29.421
get link which is just kind of a wrapper around a

00:06:29.501 --> 00:06:30.537
database query.

00:06:30.552 --> 00:06:32.952
And if it's not found we can go ahead and return

00:06:32.952 --> 00:06:33.432
null.

00:06:34.552 --> 00:06:36.072
And if it is found

00:06:36.552 --> 00:06:38.792
just for this very first time what we're going to

00:06:38.792 --> 00:06:39.752
do is we're going to

00:06:40.232 --> 00:06:41.912
save it into a database.

00:06:42.072 --> 00:06:44.632
So I'm calling this Save LinkInfo to KV.

00:06:44.712 --> 00:06:46.912
So we'll go ahead and we will write this query

00:06:46.912 --> 00:06:47.672
really quickly.

00:06:49.272 --> 00:06:50.232
So I'm going to say

00:06:50.840 --> 00:06:51.239
save

00:06:51.559 --> 00:06:53.919
link info into KB and this is going to take an

00:06:53.919 --> 00:06:54.699
embassy,

00:06:54.849 --> 00:06:57.049
going to take an ID which is the key and then the

00:06:57.049 --> 00:06:59.169
value is the link info and it's of this link

00:06:59.169 --> 00:06:59.889
infotype.

00:07:00.049 --> 00:07:02.569
And what you're going to notice here is we have a

00:07:02.569 --> 00:07:05.569
ENV cache put and we're saving this information.

00:07:05.949 --> 00:07:06.909
we're saving this information

00:07:07.309 --> 00:07:08.389
into the kv.

00:07:08.389 --> 00:07:11.189
So the next time this method is called we'll be

00:07:11.189 --> 00:07:13.909
able to grab the data from the KV and we won't

00:07:13.909 --> 00:07:15.480
have to make a database call.

00:07:15.480 --> 00:07:17.457
And then the last thing is obviously just

00:07:17.457 --> 00:07:18.097
returning

00:07:18.747 --> 00:07:19.867
the link info.

00:07:21.547 --> 00:07:22.907
So that is pretty

00:07:22.943 --> 00:07:24.713
concise and a pretty tight method here.

00:07:24.713 --> 00:07:25.913
I think this is pretty clean.

00:07:26.313 --> 00:07:28.233
Now one other note about

00:07:28.833 --> 00:07:30.753
a cloudflare KB is

00:07:31.263 --> 00:07:32.513
essentially you.

00:07:32.593 --> 00:07:35.033
So you can store really as much information as you

00:07:35.033 --> 00:07:35.233
like.

00:07:35.233 --> 00:07:37.393
I forgot what the exact limits are but I don't

00:07:37.393 --> 00:07:39.153
really think that the limits in terms of storage

00:07:39.153 --> 00:07:40.993
is something crazy relevant for this.

00:07:41.333 --> 00:07:44.413
but you also have the ability when you are saving

00:07:44.413 --> 00:07:44.773
data

00:07:45.173 --> 00:07:47.253
you can pass in a few different things.

00:07:47.983 --> 00:07:48.943
you can pass in

00:07:49.663 --> 00:07:50.783
a type that you expect.

00:07:50.943 --> 00:07:52.063
You can also set

00:07:52.203 --> 00:07:53.943
a TTL which means a total time to live.

00:07:53.943 --> 00:07:55.823
So you can basically say when you save something.

00:07:56.303 --> 00:07:58.823
I want this to automatically be cleaned up and

00:07:58.823 --> 00:08:01.103
deleted by Cloudflare at a later date.

00:08:01.423 --> 00:08:03.663
So what we can do is we can basically set a.

00:08:08.339 --> 00:08:09.882
We can set an expiration ttl

00:08:10.587 --> 00:08:12.427
and this is going to be in seconds.

00:08:12.587 --> 00:08:13.787
So for this purpose,

00:08:13.787 --> 00:08:16.187
let's just say for now this is kind of arbitrary.

00:08:16.187 --> 00:08:17.307
So one minute

00:08:18.427 --> 00:08:18.827
times

00:08:20.427 --> 00:08:20.827
one,

00:08:22.127 --> 00:08:23.007
times 60.

00:08:23.247 --> 00:08:24.687
So it's going to be one hour

00:08:25.167 --> 00:08:26.127
times 24.

00:08:26.207 --> 00:08:28.287
So we will cache for exactly 24 hours.

00:08:28.287 --> 00:08:28.687
Now,

00:08:29.547 --> 00:08:32.027
caching logic is going to be entirely dependent on

00:08:32.027 --> 00:08:32.427
you,

00:08:32.587 --> 00:08:32.987
so

00:08:33.467 --> 00:08:34.427
TTL time,

00:08:41.471 --> 00:08:42.591
depending on your use case,

00:08:42.591 --> 00:08:44.031
I think this should be fine for now.

00:08:44.131 --> 00:08:45.371
so basically we're gonna,

00:08:45.371 --> 00:08:46.491
we're not gonna balloon cache,

00:08:46.491 --> 00:08:47.451
we're not gonna have a whole bunch of,

00:08:47.451 --> 00:08:47.611
like,

00:08:47.611 --> 00:08:49.091
data that's stored unnecessarily,

00:08:49.091 --> 00:08:51.251
but then if there's a link that's being visited

00:08:51.251 --> 00:08:51.891
frequently,

00:08:52.011 --> 00:08:53.811
we'll be pulling from the cache all the time.

00:08:53.811 --> 00:08:54.211
So

00:08:54.801 --> 00:08:55.561
I think this is a,

00:08:55.561 --> 00:08:56.721
this is a good ttl.

00:08:56.831 --> 00:08:58.301
and if you're curious about ttl,

00:08:58.301 --> 00:09:01.981
my video on Cloudflare KV goes into depth onto

00:09:01.981 --> 00:09:02.941
that aspect of it as well.

00:09:02.941 --> 00:09:03.261
But yeah,

00:09:03.261 --> 00:09:04.501
it's pretty cool that you can basically just say,

00:09:04.501 --> 00:09:05.581
I'm going to store some information

00:09:06.141 --> 00:09:07.861
and I'm not going to worry about cleaning it up

00:09:07.861 --> 00:09:08.101
later.

00:09:08.101 --> 00:09:09.901
Cloudflare is just going to delete it for me once

00:09:09.901 --> 00:09:10.751
this time is hit.

00:09:10.751 --> 00:09:11.255
All right,

00:09:11.415 --> 00:09:12.935
so now that we have

00:09:13.255 --> 00:09:14.535
our git destination,

00:09:14.855 --> 00:09:16.535
our git routing destination,

00:09:16.535 --> 00:09:17.815
we can head back over to

00:09:18.295 --> 00:09:19.255
App ts,

00:09:19.525 --> 00:09:20.645
and then I'm just going to

00:09:21.285 --> 00:09:23.285
call that instead of our get links,

00:09:23.605 --> 00:09:24.725
we're going to pass in

00:09:25.045 --> 00:09:26.165
C emv,

00:09:26.405 --> 00:09:27.845
we'll pass in our id.

00:09:28.565 --> 00:09:29.645
And yeah,

00:09:29.645 --> 00:09:30.565
that's all we need.

00:09:30.725 --> 00:09:32.965
So we get that same type link info.

00:09:32.965 --> 00:09:35.364
So that's the only change to the code here.

00:09:35.364 --> 00:09:36.945
You can see it's still very tight.

00:09:36.945 --> 00:09:39.225
it's a very clean method or a very clean route.

00:09:39.385 --> 00:09:41.145
And we've pushed a lot of this,

00:09:41.145 --> 00:09:41.505
like,

00:09:41.505 --> 00:09:44.265
wrangling of the data and saving into the cache

00:09:44.265 --> 00:09:47.385
and checking into this route ops to help us

00:09:47.705 --> 00:09:49.778
keep things a little bit more modular and clean.

00:09:49.866 --> 00:09:50.906
So you can run this locally,

00:09:50.906 --> 00:09:52.826
make sure everything is working as expected

00:09:53.146 --> 00:09:53.706
and then

00:09:53.956 --> 00:09:56.276
obviously what we're going to be getting into the

00:09:56.276 --> 00:09:57.036
pattern of

00:09:57.356 --> 00:09:59.556
doing very frequently is once we make any type of

00:09:59.556 --> 00:10:00.156
major change,

00:10:00.476 --> 00:10:02.836
we're going to make sure we're able to deploy and

00:10:02.836 --> 00:10:03.716
everything works as expected.

00:10:03.716 --> 00:10:04.836
So we say pnpm,

00:10:04.836 --> 00:10:05.196
run,

00:10:05.676 --> 00:10:06.316
deploy.

00:10:06.556 --> 00:10:09.516
This deployment should give us access to the

00:10:10.436 --> 00:10:11.276
key value pair,

00:10:11.276 --> 00:10:13.236
the cloudflare KV as a binding.

00:10:13.656 --> 00:10:15.216
So this should go through the deployment process

00:10:15.216 --> 00:10:17.108
and when it's done we'll go ahead and check that.

00:10:17.108 --> 00:10:17.392
Oh,

00:10:17.392 --> 00:10:19.712
and it looks like we have one error here.

00:10:20.192 --> 00:10:21.192
So unexpected.

00:10:21.192 --> 00:10:22.512
It looks like I have a,

00:10:23.362 --> 00:10:25.872
looks like I have a type error somewhere in this

00:10:25.872 --> 00:10:26.312
code.

00:10:27.022 --> 00:10:28.542
Because I was copying pasting,

00:10:28.782 --> 00:10:30.422
I don't think you'll run into this issue.

00:10:30.422 --> 00:10:31.422
But just note,

00:10:31.722 --> 00:10:33.662
this build process will typically if there's some

00:10:33.662 --> 00:10:34.862
type of issue with your code,

00:10:34.942 --> 00:10:37.302
it'll tell you exactly where that failure is and

00:10:37.302 --> 00:10:39.102
then you'll be able to rectify that pretty

00:10:39.102 --> 00:10:39.462
quickly.

00:10:39.462 --> 00:10:41.462
So this is why I like to deploy frequently just so

00:10:41.462 --> 00:10:43.802
your applications is not in a state that isn't

00:10:44.202 --> 00:10:44.522
you know,

00:10:44.522 --> 00:10:46.402
running and working and behaving in a healthy

00:10:46.402 --> 00:10:46.606
manner.

00:10:46.608 --> 00:10:47.628
right now that we see,

00:10:47.628 --> 00:10:49.628
now we can see that this deployment was

00:10:49.628 --> 00:10:50.308
successful.

00:10:50.708 --> 00:10:52.388
I'll head over to the browser

00:10:52.948 --> 00:10:54.548
and let's just grab this.

00:10:54.548 --> 00:10:56.668
So this should redirect us as a.

00:10:56.668 --> 00:10:57.948
So watch how long this takes.

00:10:57.948 --> 00:10:59.108
This is taking some time,

00:10:59.968 --> 00:11:01.528
honestly it's taking longer than it should,

00:11:01.528 --> 00:11:02.968
but I think that's just because of that network

00:11:02.968 --> 00:11:04.128
travel from Malaysia.

00:11:04.368 --> 00:11:06.928
But now let's go ahead and hit that one more time,

00:11:06.928 --> 00:11:08.048
that exact same link.

00:11:08.288 --> 00:11:10.128
And we should notice that this speeds up

00:11:10.128 --> 00:11:11.168
tremendously.

00:11:11.420 --> 00:11:11.696
Yep.

00:11:11.710 --> 00:11:14.230
So it's able to redirect and that was able to hit

00:11:14.230 --> 00:11:14.910
the cache.

00:11:14.910 --> 00:11:15.310
So

00:11:15.440 --> 00:11:17.310
a few different notes here if you really want to.

00:11:17.390 --> 00:11:19.790
What you could do is you could come into,

00:11:20.370 --> 00:11:21.650
you could come into this method

00:11:21.960 --> 00:11:23.320
and you could add some logs.

00:11:23.400 --> 00:11:26.280
So you could basically say like console log

00:11:26.520 --> 00:11:27.160
checking,

00:11:29.937 --> 00:11:31.217
checking cache

00:11:33.297 --> 00:11:34.657
and then you could say

00:11:35.137 --> 00:11:37.657
inside of here you could say like retrieve from

00:11:37.657 --> 00:11:39.737
cache and you could put some logging statements

00:11:39.737 --> 00:11:40.177
out here.

00:11:40.457 --> 00:11:41.677
you could deploy your changes.

00:11:41.757 --> 00:11:43.746
Then you could head over to your worker code,

00:11:44.127 --> 00:11:45.327
you could go to your data service,

00:11:45.605 --> 00:11:46.904
head over to the logs.

00:11:46.905 --> 00:11:48.620
Then you could do real time logs right here,

00:11:49.100 --> 00:11:51.740
select events and then you would be able to see,

00:11:51.820 --> 00:11:53.100
as you do this,

00:11:53.110 --> 00:11:54.644
as you do this dynamic routing,

00:11:56.338 --> 00:11:57.960
you'd be able to see these logs come in,

00:11:57.960 --> 00:11:58.480
in real time,

00:11:58.480 --> 00:11:59.760
you'd be able to see those messages.

00:11:59.760 --> 00:12:00.920
So if you ever need a debug,

00:12:00.920 --> 00:12:02.160
and you actually want to do that.

00:12:02.160 --> 00:12:03.450
It's in production or,

00:12:03.450 --> 00:12:03.690
like,

00:12:03.690 --> 00:12:04.650
after you've deployed.

00:12:04.650 --> 00:12:06.090
That's a great way of doing so.

