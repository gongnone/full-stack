WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.114 --> 00:00:00.514
All right,

00:00:00.514 --> 00:00:04.194
so now that our route has access to the actual

00:00:05.164 --> 00:00:08.444
smartlink configuration with all of the attributed

00:00:08.444 --> 00:00:09.884
routing logic,

00:00:10.284 --> 00:00:12.083
what we can do is we can go ahead and we can

00:00:12.083 --> 00:00:14.724
actually build out the routing behavior within our

00:00:14.724 --> 00:00:15.324
application.

00:00:15.484 --> 00:00:15.884
So

00:00:16.244 --> 00:00:18.004
the very first thing that we're going to do is

00:00:18.004 --> 00:00:19.684
we're going to do some basic error handling.

00:00:20.004 --> 00:00:22.164
So I'm going to go ahead and call this,

00:00:22.474 --> 00:00:24.394
instead of link info from db,

00:00:24.394 --> 00:00:25.994
I'm just going to call this link info.

00:00:26.314 --> 00:00:26.954
And then

00:00:27.564 --> 00:00:31.044
what we can do is we can say if link info is null.

00:00:31.044 --> 00:00:33.724
So basically if somebody throws in like a wrong

00:00:34.044 --> 00:00:35.344
link that isn't found,

00:00:35.744 --> 00:00:38.624
we're going to want to have some basic 404 logic

00:00:38.624 --> 00:00:40.544
where we say the destination not found.

00:00:40.544 --> 00:00:43.104
Now if this was going to be a true user facing

00:00:43.104 --> 00:00:43.744
application,

00:00:44.064 --> 00:00:46.624
you would want to return a component that is

00:00:46.624 --> 00:00:47.064
styled,

00:00:47.064 --> 00:00:47.744
that is like,

00:00:47.744 --> 00:00:48.984
looks nice with your branding,

00:00:48.984 --> 00:00:49.744
that says like,

00:00:50.364 --> 00:00:50.804
like the,

00:00:50.804 --> 00:00:51.204
sorry,

00:00:51.204 --> 00:00:52.484
this leak is not found or whatever,

00:00:52.484 --> 00:00:53.844
but for now it's just going to be text.

00:00:53.844 --> 00:00:56.284
Because I just do not want to balloon this

00:00:56.864 --> 00:00:59.464
course past the point where like it's not adding

00:00:59.464 --> 00:01:00.024
that much value.

00:01:00.024 --> 00:01:01.824
I just want to be able to crank out as much

00:01:01.824 --> 00:01:04.704
information as possible related to building intent

00:01:04.704 --> 00:01:06.144
services on top of Cloudflare.

00:01:06.944 --> 00:01:09.224
so additionally what we're going to want to do is

00:01:09.224 --> 00:01:10.624
we're also going to want to

00:01:11.004 --> 00:01:14.364
create or grab the header information related to

00:01:14.364 --> 00:01:15.644
the actual routing.

00:01:15.644 --> 00:01:16.044
So

00:01:16.454 --> 00:01:18.294
we haven't actually gone over this yet.

00:01:18.614 --> 00:01:19.014
So

00:01:19.084 --> 00:01:21.234
what we can do is we can head over to our

00:01:23.134 --> 00:01:26.374
ops package and then inside of here we are

00:01:26.374 --> 00:01:28.134
actually going to create a new folder

00:01:28.694 --> 00:01:31.814
and that folder is going to be called Schemas.

00:01:32.054 --> 00:01:32.454
So

00:01:33.034 --> 00:01:36.274
actually I think a better name for it is just

00:01:36.274 --> 00:01:36.914
going to be Zod.

00:01:36.914 --> 00:01:37.514
So basically

00:01:37.884 --> 00:01:40.074
we use ODD in this application to make sure things

00:01:40.074 --> 00:01:42.834
are type safe and we can like parse data to ensure

00:01:43.074 --> 00:01:46.474
that a object coming from an unknown source is of

00:01:46.474 --> 00:01:47.394
a certain type.

00:01:47.674 --> 00:01:49.754
and a lot of times we're going to want to share

00:01:49.994 --> 00:01:52.194
these types across different projects.

00:01:52.194 --> 00:01:55.354
So that basically what we want to do is we want to

00:01:55.354 --> 00:01:57.194
head back over to our Data Ops package.

00:01:57.324 --> 00:02:00.594
and inside of source we can create a new folder

00:02:00.594 --> 00:02:01.634
called Zod.

00:02:01.714 --> 00:02:02.594
So I'm going to say

00:02:03.154 --> 00:02:03.634
Zod

00:02:03.775 --> 00:02:05.547
and it looks like it should already actually be

00:02:05.547 --> 00:02:06.187
part of this

00:02:06.207 --> 00:02:06.667
this project.

00:02:07.067 --> 00:02:08.267
So inside of here

00:02:08.707 --> 00:02:10.897
we're going to have links and a lot of these are

00:02:10.897 --> 00:02:13.097
going to be predefined for us just so we don't

00:02:13.097 --> 00:02:15.057
waste too much time typing a whole Bunch of stuff

00:02:15.057 --> 00:02:15.337
out.

00:02:15.967 --> 00:02:17.727
but the one that we care about is actually going

00:02:17.727 --> 00:02:19.767
to be called Cloudflare info schema.

00:02:19.767 --> 00:02:21.727
So what I've done here is I have added

00:02:22.207 --> 00:02:23.487
a Zod schema

00:02:23.887 --> 00:02:25.647
that grabs the information that we've already

00:02:25.647 --> 00:02:27.007
discussed that we care about,

00:02:27.077 --> 00:02:27.807
the actual country,

00:02:28.287 --> 00:02:30.047
the latitude and the longitude.

00:02:30.047 --> 00:02:31.406
And then I just have some

00:02:31.457 --> 00:02:33.447
additional like helpers here to make sure,

00:02:33.687 --> 00:02:35.167
like the latitude and the longitude,

00:02:35.167 --> 00:02:36.487
it comes in as a string,

00:02:36.997 --> 00:02:39.747
that we are going to be parsing that into a number

00:02:40.217 --> 00:02:42.777
before it is actually accessed by our code.

00:02:42.837 --> 00:02:45.217
so we have a little pre processor or transform

00:02:45.217 --> 00:02:47.457
method here and then we have a country and these

00:02:47.457 --> 00:02:48.137
are all optional

00:02:48.457 --> 00:02:51.537
just so we can ensure we have like a type safe,

00:02:51.537 --> 00:02:53.197
object of this information

00:02:53.597 --> 00:02:55.677
because the data that's coming from the Cloudflare

00:02:55.677 --> 00:02:57.037
headers is of the type unknown.

00:02:57.157 --> 00:02:59.077
so we can't really make use of it.

00:02:59.637 --> 00:03:02.277
Now what we could do is we could head back to our,

00:03:02.847 --> 00:03:06.287
we can head back to our app TS in our data service

00:03:06.447 --> 00:03:06.737
and,

00:03:06.807 --> 00:03:07.847
and we can import this

00:03:08.327 --> 00:03:09.047
schema.

00:03:09.447 --> 00:03:10.887
So we'll go ahead and say

00:03:11.207 --> 00:03:14.647
from our Repo Data Ops Zod schema folder,

00:03:14.647 --> 00:03:16.887
we're going to say here are our links

00:03:17.527 --> 00:03:18.547
or here are our

00:03:18.687 --> 00:03:19.979
Cloudflare info schema

00:03:19.979 --> 00:03:21.304
and we can pass in

00:03:21.828 --> 00:03:22.140
the.

00:03:22.220 --> 00:03:23.420
So I'm going to say const

00:03:24.938 --> 00:03:25.328
cf

00:03:25.888 --> 00:03:26.528
headers

00:03:26.848 --> 00:03:28.608
and it's just going to be the headers that we care

00:03:28.608 --> 00:03:28.928
about.

00:03:29.088 --> 00:03:30.098
So we're going to say dot

00:03:30.368 --> 00:03:30.768
parse

00:03:31.488 --> 00:03:33.568
I'm going to actually safe parse this just so we

00:03:33.568 --> 00:03:35.888
don't throw an error because there's a very valid

00:03:35.888 --> 00:03:37.768
scenario where we might not have all the headers

00:03:37.768 --> 00:03:38.608
that we need and

00:03:39.168 --> 00:03:41.448
we still are able to route people to the default

00:03:41.448 --> 00:03:41.888
destination.

00:03:42.288 --> 00:03:43.928
So I'm going to say safe parse and then I'm going

00:03:43.928 --> 00:03:47.488
to say c.rec.raw

00:03:48.208 --> 00:03:48.848
cf.

00:03:48.848 --> 00:03:50.048
So we'll pass it that information

00:03:50.608 --> 00:03:51.968
and then the output,

00:03:52.448 --> 00:03:53.448
we're going to handle it.

00:03:53.448 --> 00:03:56.948
So we're going to say if CF header.

00:03:57.218 --> 00:03:58.602
we'll say error.

00:03:58.602 --> 00:04:00.922
Now let's say say if it's not successful.

00:04:00.922 --> 00:04:02.682
So if it's not successful,

00:04:03.722 --> 00:04:06.322
what we want to do is we're going to do a very

00:04:06.322 --> 00:04:08.842
similar error here where we're going to return c

00:04:08.842 --> 00:04:09.641
dot text

00:04:10.362 --> 00:04:11.642
and it's going to be

00:04:12.890 --> 00:04:14.490
I actually wonder if we,

00:04:14.890 --> 00:04:16.370
for now we'll handle this error.

00:04:16.370 --> 00:04:18.490
But I just wonder like in a scenario where you

00:04:18.490 --> 00:04:19.610
actually have a,

00:04:19.770 --> 00:04:20.108
like

00:04:20.184 --> 00:04:21.544
these headers fail to actually

00:04:22.164 --> 00:04:22.864
be parsable,

00:04:22.864 --> 00:04:25.064
we probably want to route them to like the Default

00:04:25.064 --> 00:04:25.584
destination.

00:04:25.984 --> 00:04:26.744
So we'll,

00:04:26.744 --> 00:04:27.664
we'll probably add that later,

00:04:27.664 --> 00:04:29.344
but for now I'm just going to say C.

00:04:29.504 --> 00:04:29.984
Txt

00:04:30.644 --> 00:04:32.384
we're just going to return the text invalid

00:04:32.384 --> 00:04:33.384
Cloudflare headers.

00:04:33.384 --> 00:04:35.504
Now I think we can actually handle this a little

00:04:35.504 --> 00:04:35.864
bit better,

00:04:35.864 --> 00:04:37.304
but let's be on the point for now.

00:04:37.684 --> 00:04:39.584
and then what we're going to want to do is now

00:04:39.584 --> 00:04:41.344
that we have the headers is we're going to want to

00:04:41.344 --> 00:04:43.242
look at the actual country code

00:04:43.426 --> 00:04:44.386
so we can say

00:04:44.966 --> 00:04:45.366
const

00:04:46.806 --> 00:04:47.446
headers

00:04:48.486 --> 00:04:49.046
equals

00:04:49.926 --> 00:04:50.646
dot data.

00:04:51.286 --> 00:04:51.686
So

00:04:52.136 --> 00:04:53.736
this will give us access to the country

00:04:54.136 --> 00:04:55.496
and in order to.

00:04:56.136 --> 00:04:57.536
So basically what we're going to want to do is

00:04:57.536 --> 00:04:58.856
we're going to want to look up

00:04:59.336 --> 00:04:59.736
the

00:04:59.976 --> 00:05:03.296
the routing logic inside of our link info that is

00:05:03.296 --> 00:05:06.216
provided from our database query for those link

00:05:06.216 --> 00:05:06.976
configurations.

00:05:07.376 --> 00:05:09.136
And we're going to want to see if the destination

00:05:09.136 --> 00:05:11.056
is in there and if it's not we're going to fall

00:05:11.056 --> 00:05:12.336
back to the default dest.

00:05:12.876 --> 00:05:13.116
And

00:05:13.396 --> 00:05:14.816
this code is insanely simple,

00:05:14.816 --> 00:05:15.696
but it's also

00:05:16.016 --> 00:05:18.056
kind of a little bit tedious to write.

00:05:18.056 --> 00:05:20.296
And I just feel like this is going to become very,

00:05:20.296 --> 00:05:22.096
very cluttered if we put all of our

00:05:22.556 --> 00:05:22.716
app,

00:05:22.716 --> 00:05:25.036
we put all of our logic under a single route.

00:05:25.196 --> 00:05:25.596
So

00:05:25.976 --> 00:05:28.296
what I want to do is I'm going to create a new

00:05:28.296 --> 00:05:30.456
folder and we'll just call this Helpers for now.

00:05:31.656 --> 00:05:33.016
And inside of Helpers

00:05:33.656 --> 00:05:36.456
let's call this Routing Ops

00:05:37.096 --> 00:05:37.816
ts

00:05:37.896 --> 00:05:38.476
if you notice,

00:05:38.476 --> 00:05:40.156
I like the word ops for different types of

00:05:40.156 --> 00:05:41.076
operations that happen.

00:05:41.516 --> 00:05:41.836
I think

00:05:42.236 --> 00:05:46.556
naming functions and variables and files in the

00:05:47.206 --> 00:05:49.136
software development world is very controversial.

00:05:49.136 --> 00:05:49.816
People have very,

00:05:49.816 --> 00:05:50.896
very strong opinions.

00:05:51.536 --> 00:05:51.936
Okay,

00:05:51.936 --> 00:05:52.776
for the purpose of time,

00:05:52.776 --> 00:05:53.856
let's just go ahead and

00:05:54.556 --> 00:05:56.996
I'm just going to paste over this code that I have

00:05:56.996 --> 00:05:57.676
pre written.

00:05:57.756 --> 00:05:59.676
This is going to do our conditional

00:05:59.986 --> 00:06:00.736
routing logic.

00:06:00.736 --> 00:06:02.696
So we actually have this leak schema,

00:06:02.696 --> 00:06:03.166
typed

00:06:03.276 --> 00:06:06.476
Skype type defined inside of our Data Ops package.

00:06:06.766 --> 00:06:08.286
And this is going to be coming from our Zod

00:06:08.286 --> 00:06:08.846
schemas.

00:06:09.486 --> 00:06:11.926
And we can look at this and this has like the

00:06:11.926 --> 00:06:12.166
name,

00:06:12.166 --> 00:06:12.926
the link id,

00:06:12.926 --> 00:06:14.446
the account ID and the destination.

00:06:14.446 --> 00:06:16.606
So this is all of the information that is actually

00:06:16.606 --> 00:06:17.326
in our

00:06:17.526 --> 00:06:21.026
that is saved in our D1 database when we create a

00:06:21.026 --> 00:06:21.386
link.

00:06:21.406 --> 00:06:23.046
you can go ahead and head over to the

00:06:23.786 --> 00:06:26.186
Query Explorer inside the Cloudflare dashboard and

00:06:26.186 --> 00:06:27.706
you can go inspect the data if you want to,

00:06:27.706 --> 00:06:28.426
just to make sure.

00:06:28.756 --> 00:06:29.396
but yeah,

00:06:29.636 --> 00:06:30.916
this is the type and

00:06:31.326 --> 00:06:32.846
then what we're going to do is we're basically

00:06:32.846 --> 00:06:34.446
going to also pass in the country code,

00:06:34.446 --> 00:06:36.406
which can be optional from cloudflare.

00:06:36.406 --> 00:06:37.446
So the cloud,

00:06:37.446 --> 00:06:37.806
the

00:06:38.453 --> 00:06:40.954
the country code will not be there or could

00:06:40.954 --> 00:06:41.514
possibly

00:06:41.654 --> 00:06:42.414
be undefined.

00:06:42.494 --> 00:06:44.094
So if it's undefined,

00:06:44.094 --> 00:06:46.053
what we're going to do is we're basically going to

00:06:46.053 --> 00:06:48.934
say give us the default URL and that's going to be

00:06:48.934 --> 00:06:50.174
what we use for the routing.

00:06:50.174 --> 00:06:50.654
And then

00:06:51.814 --> 00:06:52.854
as well as that,

00:06:52.854 --> 00:06:54.334
what we're going to also do is we're going to say

00:06:54.334 --> 00:06:55.334
the link info

00:06:55.514 --> 00:06:57.674
destinations and then we're going to pass in the

00:06:57.674 --> 00:06:58.314
country code.

00:06:58.314 --> 00:06:59.514
And if that's not null,

00:06:59.514 --> 00:07:01.594
meaning there is a country code in that

00:07:01.594 --> 00:07:02.314
configuration,

00:07:02.554 --> 00:07:04.514
then we're going to return that link and then the

00:07:04.514 --> 00:07:06.474
fallback is just going to be our

00:07:07.534 --> 00:07:09.134
link info destinations.

00:07:09.294 --> 00:07:12.254
So we can go ahead and we can use this in our

00:07:12.254 --> 00:07:12.654
code.

00:07:12.734 --> 00:07:13.694
So head back over,

00:07:13.694 --> 00:07:14.830
we'll say make sure it's saved,

00:07:14.830 --> 00:07:16.669
head back over to our app ts

00:07:16.669 --> 00:07:18.292
and then what we're going to do is we're going to

00:07:18.292 --> 00:07:18.572
say

00:07:18.972 --> 00:07:20.002
construction

00:07:20.552 --> 00:07:22.472
destinations equal

00:07:23.112 --> 00:07:24.632
and we'll import this code

00:07:25.446 --> 00:07:25.846
and

00:07:26.406 --> 00:07:28.406
we have to make sure that we pass our

00:07:28.806 --> 00:07:29.557
link info

00:07:29.557 --> 00:07:32.325
because this is the type from our database call.

00:07:32.485 --> 00:07:34.085
And then we will also return

00:07:34.405 --> 00:07:34.804
our

00:07:35.915 --> 00:07:39.115
headers.country so we'll pass that in.

00:07:40.155 --> 00:07:41.995
So now this should

00:07:42.344 --> 00:07:43.224
I deleted country

00:07:43.288 --> 00:07:44.193
headers country

00:07:45.393 --> 00:07:48.073
so now this will always return a string so there

00:07:48.073 --> 00:07:50.473
will always be a URL at this point that we get

00:07:50.473 --> 00:07:52.793
back where we can actually handle our conditional

00:07:52.793 --> 00:07:53.313
routing.

00:07:53.753 --> 00:07:56.153
so then instead of just returning this JSON block

00:07:56.153 --> 00:07:56.633
for now,

00:07:56.633 --> 00:07:58.593
what we're going to do is we are going to say

00:07:58.593 --> 00:07:58.953
return

00:07:59.433 --> 00:08:00.793
C redirect

00:08:01.273 --> 00:08:03.193
and we will pass in the destination.

00:08:03.993 --> 00:08:06.153
we're just going to call this destination singular

00:08:06.233 --> 00:08:08.473
because it's just one single destination that's

00:08:08.473 --> 00:08:09.273
going to be routed to.

00:08:09.673 --> 00:08:11.993
So now if we come back and we reload this,

00:08:11.993 --> 00:08:15.033
we should actually be routed to a destination URL

00:08:15.033 --> 00:08:17.313
which is just this like dummy in grok URL.

00:08:17.313 --> 00:08:19.753
So what I'm going to do is I'm going to go back to

00:08:19.753 --> 00:08:20.073
here.

00:08:20.313 --> 00:08:20.873
So I

00:08:21.193 --> 00:08:23.353
will come back to our Smart Links application

00:08:23.833 --> 00:08:25.993
and let's just go ahead and let's modify

00:08:26.613 --> 00:08:29.173
let's modify product 3 to give it a better

00:08:30.423 --> 00:08:31.465
URL here so

00:08:31.465 --> 00:08:33.454
we can come over here and I'm just going to say

00:08:33.454 --> 00:08:34.534
this is going to go to

00:08:34.934 --> 00:08:36.614
google.com so

00:08:37.268 --> 00:08:38.548
we can add our

00:08:38.868 --> 00:08:40.416
destination to google.com

00:08:40.416 --> 00:08:41.586
go ahead and save that.

00:08:41.906 --> 00:08:42.306
And

00:08:43.126 --> 00:08:43.486
our.

00:08:43.486 --> 00:08:44.646
This is our link ID.

00:08:45.206 --> 00:08:47.606
So go to port 8787,

00:08:48.166 --> 00:08:49.926
the application that's running locally,

00:08:50.726 --> 00:08:53.083
hit that and you can see it routes to Google.

00:08:53.118 --> 00:08:53.398
All right,

00:08:53.398 --> 00:08:55.878
so now that we know that our redirect logic is

00:08:55.878 --> 00:08:57.958
working and we're successfully able to pull a link

00:08:57.958 --> 00:08:59.398
configuration from our database,

00:08:59.398 --> 00:09:02.078
let's just go ahead and ensure that our geo based

00:09:02.078 --> 00:09:03.358
routing logic holds up.

00:09:03.438 --> 00:09:03.838
And

00:09:04.318 --> 00:09:05.958
order to do that let's just go ahead and deploy

00:09:05.958 --> 00:09:07.598
just to make sure the app is always staying in a

00:09:07.598 --> 00:09:08.038
good state.

00:09:08.198 --> 00:09:09.958
So what we can do is

00:09:10.598 --> 00:09:12.918
just make sure you don't have any type errors.

00:09:12.968 --> 00:09:15.138
you can always head over to your wrangler,

00:09:15.568 --> 00:09:17.938
JSON C just to make sure there's nothing weird

00:09:17.938 --> 00:09:18.208
here.

00:09:18.418 --> 00:09:19.138
the service

00:09:19.438 --> 00:09:19.878
is going to,

00:09:19.878 --> 00:09:21.998
or we've already deployed so it's going to be

00:09:22.158 --> 00:09:24.718
reachable by the service name data service here

00:09:24.878 --> 00:09:26.878
and then we'll just say pnpm run,

00:09:27.118 --> 00:09:27.758
deploy.

00:09:28.638 --> 00:09:30.478
looks like I did a little typo there

00:09:32.532 --> 00:09:34.039
and you'll be able to see that

00:09:34.169 --> 00:09:36.279
as we deploy that we're actually going to be

00:09:36.279 --> 00:09:37.319
having the binding

00:09:37.669 --> 00:09:39.109
for that D1 database.

00:09:39.189 --> 00:09:39.589
So,

00:09:39.948 --> 00:09:42.508
so it looks like it has successfully deployed.

00:09:42.668 --> 00:09:44.099
Let's grab our URL,

00:09:44.099 --> 00:09:45.173
let's head over here.

00:09:45.481 --> 00:09:48.201
This should be a 404 for now because we don't have

00:09:48.201 --> 00:09:49.121
any handling here.

00:09:49.121 --> 00:09:51.321
It's just a very skinned down web service.

00:09:52.051 --> 00:09:55.441
we will head over to this link that we have in our

00:09:55.441 --> 00:09:56.401
user application.

00:09:56.658 --> 00:09:58.618
This should route to Google because the default

00:09:58.618 --> 00:10:00.178
URL is still Google.

00:10:01.138 --> 00:10:04.098
And in order to test the geo based routing let's

00:10:04.098 --> 00:10:05.378
go ahead and

00:10:06.068 --> 00:10:07.428
go to NordVPN.

00:10:07.668 --> 00:10:08.508
So you don't,

00:10:08.508 --> 00:10:09.428
if you don't have a VPN,

00:10:09.428 --> 00:10:10.668
you don't have to follow along here.

00:10:10.668 --> 00:10:11.508
It's kind of

00:10:11.788 --> 00:10:12.468
beyond the point.

00:10:12.468 --> 00:10:14.308
Now I have noticed that

00:10:15.028 --> 00:10:16.668
some VPN providers,

00:10:16.668 --> 00:10:18.548
when they say you're connected to a region,

00:10:18.948 --> 00:10:21.228
you're actually not connected to that region.

00:10:21.228 --> 00:10:22.468
You're connected to another country.

00:10:22.468 --> 00:10:25.268
Especially like in Europe or Asia where there's a

00:10:25.268 --> 00:10:26.828
bunch of countries that are really close to each

00:10:26.828 --> 00:10:27.108
other.

00:10:27.108 --> 00:10:29.048
So what we're going to do is we're going to say

00:10:29.048 --> 00:10:31.128
Malaysia and I hope this works for this example.

00:10:31.478 --> 00:10:33.518
we're going to connect to Malaysia and then we're

00:10:33.518 --> 00:10:34.118
going to say

00:10:34.838 --> 00:10:38.678
anybody that routes from Malaysia with that link

00:10:38.758 --> 00:10:41.158
instead of going to Google they should go to

00:10:41.158 --> 00:10:41.798
LinkedIn.

00:10:41.878 --> 00:10:42.598
Now there's

00:10:43.158 --> 00:10:45.798
there in reality like this is probably going to be

00:10:45.798 --> 00:10:46.918
like a product page

00:10:47.238 --> 00:10:47.678
for people

00:10:48.398 --> 00:10:50.318
that is like country specific.

00:10:50.398 --> 00:10:51.918
So this is just kind of a stupid

00:10:52.018 --> 00:10:52.488
example.

00:10:52.488 --> 00:10:54.408
But what we'll do here is we're going to go ahead

00:10:54.408 --> 00:10:55.448
and we're going to add

00:10:56.088 --> 00:10:56.808
Malaysia

00:10:59.348 --> 00:11:01.428
and the destination is going to be LinkedIn

00:11:01.948 --> 00:11:02.952
so we'll hit save.

00:11:03.752 --> 00:11:04.952
So that is now there.

00:11:05.592 --> 00:11:07.592
So if we grab our link id

00:11:07.858 --> 00:11:10.737
forward slash this link id and this should

00:11:11.058 --> 00:11:11.898
go to LinkedIn.

00:11:11.898 --> 00:11:12.218
Yep.

00:11:12.218 --> 00:11:12.598
So that

00:11:12.598 --> 00:11:14.878
GEO based logic is working as expected,

00:11:14.878 --> 00:11:15.998
which is pretty cool there.

00:11:15.998 --> 00:11:16.398
So,

00:11:16.718 --> 00:11:17.358
okay,

00:11:17.438 --> 00:11:17.818
so

00:11:18.198 --> 00:11:20.358
if you might have noticed when we loaded this,

00:11:21.148 --> 00:11:24.108
the time that it actually took to do the redirect

00:11:24.108 --> 00:11:25.228
there was a bit of a pause.

00:11:25.228 --> 00:11:25.548
And

00:11:26.348 --> 00:11:28.508
that's largely just because like we're,

00:11:28.588 --> 00:11:29.068
you know,

00:11:29.068 --> 00:11:30.268
like it is there,

00:11:30.268 --> 00:11:31.988
there's like some network latency there.

00:11:31.988 --> 00:11:32.348
But

00:11:32.608 --> 00:11:34.848
there's also just the sheer fact that we're using

00:11:34.848 --> 00:11:36.008
a D1 database.

00:11:36.008 --> 00:11:37.568
There's going to be just like a little bit of

00:11:37.568 --> 00:11:39.048
latency that you're going to notice for that

00:11:39.048 --> 00:11:39.968
network travel time.

00:11:40.348 --> 00:11:42.228
so for this next section we're going to speed up

00:11:42.228 --> 00:11:45.788
these queries by caching that link configuration

00:11:46.468 --> 00:11:47.948
in a Cloudflare kv,

00:11:47.948 --> 00:11:50.028
which is a perfect use case for something like

00:11:50.028 --> 00:11:50.308
this.

