WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.071 --> 00:00:00.631
Alright,

00:00:00.711 --> 00:00:02.711
so now that we have everything configured,

00:00:02.791 --> 00:00:04.871
what we're going to do is we're going to head over

00:00:04.871 --> 00:00:06.471
to our user application.

00:00:06.871 --> 00:00:09.391
I'm going to just CD into our apps user

00:00:09.391 --> 00:00:11.591
application and then I'm going to open it in its

00:00:11.591 --> 00:00:12.311
new window.

00:00:12.391 --> 00:00:12.508
So

00:00:14.573 --> 00:00:17.173
integrating better authentication is going to kind

00:00:17.173 --> 00:00:18.773
of have two different layers to it.

00:00:18.773 --> 00:00:20.533
There's going to be the backend integration.

00:00:20.533 --> 00:00:22.053
So so basically configuring

00:00:22.373 --> 00:00:24.453
our Better Auth client that we just set up,

00:00:24.543 --> 00:00:27.703
the actual like server side client to wire into

00:00:27.703 --> 00:00:29.423
some API routes and to make sure that

00:00:29.423 --> 00:00:31.023
authentication is working at that level

00:00:31.343 --> 00:00:34.343
and then we're also going to add some hooks inside

00:00:34.343 --> 00:00:35.743
of our client side code.

00:00:35.743 --> 00:00:37.383
So there's two layers to this.

00:00:37.383 --> 00:00:39.423
We're going to start by modifying the backend.

00:00:39.423 --> 00:00:42.703
So essentially we have this hono API and we're

00:00:42.703 --> 00:00:45.223
going to be wiring up our authentication at that

00:00:45.223 --> 00:00:45.983
layer as well.

00:00:46.143 --> 00:00:48.743
So better Auth has some pretty good documentation

00:00:48.743 --> 00:00:49.263
on this.

00:00:49.463 --> 00:00:51.303
it's actually insanely easy how

00:00:51.923 --> 00:00:52.803
simple it is to

00:00:53.063 --> 00:00:53.464
wire

00:00:53.464 --> 00:00:53.763
to

00:00:54.163 --> 00:00:55.383
integrate with better Auth.

00:00:55.383 --> 00:00:57.443
for a lot of these frameworks we can head over to

00:00:57.443 --> 00:00:57.883
guides

00:00:58.203 --> 00:00:59.283
or sorry not guides.

00:00:59.283 --> 00:01:00.363
It's going to be in

00:01:00.558 --> 00:01:01.167
integrations,

00:01:01.432 --> 00:01:04.574
back end is going to be hono and then what you're

00:01:04.574 --> 00:01:06.214
going to see here is really the only thing that we

00:01:06.214 --> 00:01:07.694
care about is this little section.

00:01:07.774 --> 00:01:09.374
We're going to be creating a

00:01:09.704 --> 00:01:11.794
handler that takes post and gets

00:01:12.264 --> 00:01:15.064
and everything that is at the route of API

00:01:15.464 --> 00:01:15.864
auth

00:01:16.264 --> 00:01:17.944
we're going to be handling it

00:01:18.104 --> 00:01:19.704
with the auth handler.

00:01:19.784 --> 00:01:21.424
This is essentially the object that we just

00:01:21.424 --> 00:01:21.864
created.

00:01:21.864 --> 00:01:24.024
So I'm just going to copy this little snippet of

00:01:24.024 --> 00:01:25.000
code because that's all we need

00:01:25.000 --> 00:01:27.084
and I will head over to our app ts

00:01:27.084 --> 00:01:27.954
inside of our

00:01:27.954 --> 00:01:28.814
user application

00:01:30.654 --> 00:01:31.294
and then

00:01:31.694 --> 00:01:33.814
just make sure we're using the right app instance

00:01:33.814 --> 00:01:34.094
here.

00:01:34.774 --> 00:01:37.254
And then we're going to say const auth

00:01:37.734 --> 00:01:39.550
and we are going to get off.

00:01:39.550 --> 00:01:41.536
This is going to be coming from our back end or

00:01:41.616 --> 00:01:44.736
our data ops package so we can import that as

00:01:44.736 --> 00:01:45.056
well.

00:01:46.576 --> 00:01:46.976
Auth

00:01:47.144 --> 00:01:47.977
or get

00:01:48.857 --> 00:01:49.257
auth

00:01:50.297 --> 00:01:50.697
from

00:01:56.184 --> 00:01:59.064
and the get off is going to take in two different

00:01:59.144 --> 00:01:59.464
things.

00:01:59.464 --> 00:02:01.784
It's basically going to take a client id.

00:02:02.634 --> 00:02:03.834
This is a Google client ID

00:02:04.554 --> 00:02:06.154
and it's going to take a

00:02:08.259 --> 00:02:09.059
client secret

00:02:12.579 --> 00:02:14.579
which is also going going to be coming from

00:02:14.579 --> 00:02:15.059
Google.

00:02:15.459 --> 00:02:17.298
So if you've never done this before,

00:02:17.298 --> 00:02:19.139
I do think that this section of the video

00:02:19.449 --> 00:02:20.441
is going to be pretty useful.

00:02:20.441 --> 00:02:22.930
We're going to want to go head over to a Google

00:02:22.930 --> 00:02:23.450
console.

00:02:23.450 --> 00:02:23.810
So

00:02:25.650 --> 00:02:27.890
I usually just search Google console And we're

00:02:27.890 --> 00:02:29.570
going to go to the Google Cloud console.

00:02:29.798 --> 00:02:33.078
And then inside of here what we're going to do is

00:02:33.158 --> 00:02:34.118
we're going to.

00:02:34.198 --> 00:02:35.398
If you haven't created an account,

00:02:35.398 --> 00:02:36.518
this might look a little bit different,

00:02:36.518 --> 00:02:38.478
but you'll basically just create an account with

00:02:38.478 --> 00:02:39.478
Google Cloud Console.

00:02:39.938 --> 00:02:42.038
inside of Here we have APIs and we have

00:02:42.038 --> 00:02:42.652
credentials.

00:02:42.772 --> 00:02:43.532
can go ahead and

00:02:43.852 --> 00:02:45.132
create some credentials.

00:02:45.292 --> 00:02:47.388
So let's create an OAuth client

00:02:47.405 --> 00:02:49.405
and then it's going to want us to configure a

00:02:49.405 --> 00:02:50.245
consent screen.

00:02:50.245 --> 00:02:52.125
So it's going to ask for some information about

00:02:52.205 --> 00:02:52.925
our product.

00:02:53.094 --> 00:02:54.374
So we can just call this

00:02:55.734 --> 00:02:56.854
Smart Links.

00:02:56.943 --> 00:02:58.400
I'll pass in my personal email.

00:02:58.872 --> 00:03:00.678
this is going to be externally facing

00:03:01.319 --> 00:03:02.599
some more contact information.

00:03:03.579 --> 00:03:03.899
I agree.

00:03:03.899 --> 00:03:04.517
And finish.

00:03:05.018 --> 00:03:05.458
All right,

00:03:05.458 --> 00:03:07.358
so from here we can go ahead and create an OAuth,

00:03:07.418 --> 00:03:07.898
client.

00:03:07.898 --> 00:03:09.978
The application is going to be a web application

00:03:10.538 --> 00:03:12.378
and we'll just call this Smart Links.

00:03:13.892 --> 00:03:16.163
We're going to start by adding a JavaScript

00:03:16.163 --> 00:03:16.723
origin.

00:03:16.803 --> 00:03:18.963
So right now we're developing in local host and we

00:03:18.963 --> 00:03:20.243
can go add more in the future.

00:03:20.323 --> 00:03:22.083
So we can say HTTP

00:03:28.913 --> 00:03:30.033
localhost3000.

00:03:30.209 --> 00:03:30.570
Oh,

00:03:31.230 --> 00:03:32.030
must be,

00:03:32.430 --> 00:03:33.710
must be forward slash,

00:03:33.710 --> 00:03:34.361
forward slash.

00:03:34.361 --> 00:03:36.946
We will also make sure we add some authorized

00:03:36.946 --> 00:03:37.906
redirect services.

00:03:38.066 --> 00:03:40.306
So basically it's going to be our base URL

00:03:40.306 --> 00:03:42.950
API auth callback Google.

00:03:42.950 --> 00:03:44.420
So this is the convention that

00:03:44.420 --> 00:03:46.330
better auth has and I do think they have some

00:03:46.330 --> 00:03:46.600
details.

00:03:46.670 --> 00:03:47.070
Details.

00:03:47.070 --> 00:03:48.430
If you go into authentication,

00:03:48.750 --> 00:03:49.950
you head over to Google,

00:03:50.270 --> 00:03:52.110
it's going to kind of walk you through this exact

00:03:52.110 --> 00:03:53.230
same process as well.

00:03:53.580 --> 00:03:55.115
they mentioned the different things to put

00:03:55.238 --> 00:03:57.037
Now we're going to go ahead and save and it

00:03:57.037 --> 00:03:58.958
mentions it might take five minutes for this to

00:03:58.958 --> 00:03:59.398
take effect.

00:03:59.798 --> 00:04:00.998
So we'll save this guy.

00:04:01.158 --> 00:04:02.238
And just so you know,

00:04:02.238 --> 00:04:03.478
I will be wiping this

00:04:03.548 --> 00:04:04.958
client in secret in the future.

00:04:05.118 --> 00:04:06.878
So there is no reason to

00:04:06.938 --> 00:04:07.258
you know,

00:04:07.258 --> 00:04:07.738
take these

00:04:08.618 --> 00:04:10.698
so we can go ahead and copy our client id.

00:04:10.766 --> 00:04:13.086
And essentially what we're going to want to do is

00:04:13.086 --> 00:04:13.806
server side

00:04:14.526 --> 00:04:16.726
we're going to want to make sure that we pass in

00:04:16.726 --> 00:04:17.086
our

00:04:17.486 --> 00:04:19.726
we pass in the client ID and the secret.

00:04:20.206 --> 00:04:21.326
So in order to keep these

00:04:21.726 --> 00:04:22.166
safe,

00:04:22.166 --> 00:04:24.206
what we're going to do is we are going to head

00:04:24.206 --> 00:04:25.246
over to our

00:04:25.586 --> 00:04:26.626
emv file

00:04:27.106 --> 00:04:29.186
and what we can do is we can go ahead and

00:04:29.506 --> 00:04:29.796
add

00:04:30.296 --> 00:04:31.496
Google client ID

00:04:33.452 --> 00:04:34.732
and a Google client secret.

00:04:44.989 --> 00:04:46.109
Now it used to be

00:04:46.429 --> 00:04:47.069
that you,

00:04:47.069 --> 00:04:49.269
if you wanted to access these variables during

00:04:49.269 --> 00:04:50.749
local development locally,

00:04:50.989 --> 00:04:54.579
you would actually have to put it in a.dev.vars

00:04:54.579 --> 00:04:54.979
file.

00:04:55.699 --> 00:04:56.979
Now with the most recent

00:04:57.349 --> 00:04:59.019
rollout of Wrangler we can,

00:04:59.019 --> 00:05:00.579
it actually supports EMV files,

00:05:00.579 --> 00:05:01.739
which is really good.

00:05:01.819 --> 00:05:04.299
So just make sure you can say pnpm run,

00:05:05.299 --> 00:05:06.659
just pnpm update

00:05:08.019 --> 00:05:10.179
Wrangler and then we'll just say latest

00:05:11.059 --> 00:05:12.819
just to make sure we get the latest version.

00:05:12.819 --> 00:05:13.796
So this feature will work.

00:05:13.943 --> 00:05:16.023
Now what I'm going to do is I'm going to say pnpm

00:05:16.023 --> 00:05:16.823
run CF

00:05:19.883 --> 00:05:20.443
type gen

00:05:20.840 --> 00:05:22.244
that should generate these types.

00:05:22.244 --> 00:05:24.164
So you see we have a Google client ID and a Google

00:05:24.164 --> 00:05:24.644
client secret.

00:05:25.204 --> 00:05:27.284
So if we head over to our application now,

00:05:27.444 --> 00:05:29.524
we can go like this and we can say

00:05:30.044 --> 00:05:32.364
c emv.client

00:05:32.844 --> 00:05:33.244
ID

00:05:33.822 --> 00:05:34.427
and then

00:05:34.827 --> 00:05:37.627
c emv.client secret

00:05:39.567 --> 00:05:39.847
right.

00:05:40.007 --> 00:05:42.247
So in terms of like the API side of things,

00:05:42.247 --> 00:05:44.247
this is literally all the configuration that we

00:05:44.247 --> 00:05:45.077
need for better authentication.

00:05:45.467 --> 00:05:46.747
This is going to handle like

00:05:46.807 --> 00:05:48.847
to check if the user's authenticated or not.

00:05:48.847 --> 00:05:49.447
It's going to,

00:05:49.447 --> 00:05:51.287
it's going to manage the callback with Google.

00:05:51.447 --> 00:05:53.687
If we add in GitHub or other providers,

00:05:53.687 --> 00:05:55.007
this is literally all we have to do.

00:05:55.007 --> 00:05:56.367
We just have to make sure we pass in the

00:05:56.367 --> 00:05:57.407
configurations for it.

00:05:57.407 --> 00:05:58.607
So it's really awesome.

00:05:58.607 --> 00:06:00.807
It's crazy how concise they're able to make this

00:06:00.807 --> 00:06:01.127
process.

00:06:01.339 --> 00:06:03.179
So now we can run this application,

00:06:03.179 --> 00:06:04.379
we can spin this guy up

00:06:05.099 --> 00:06:06.219
PNPM run

00:06:06.539 --> 00:06:06.921
device,

00:06:06.964 --> 00:06:08.964
but we are going to want to configure a few more

00:06:08.964 --> 00:06:09.524
things here.

00:06:09.524 --> 00:06:11.404
So what we're going to want to do inside of our

00:06:11.404 --> 00:06:14.404
Wrangler JSON file is we have some asset

00:06:14.404 --> 00:06:15.204
configurations.

00:06:15.924 --> 00:06:17.914
Now what we're going to want to make sure we

00:06:17.914 --> 00:06:19.784
do is we basically want to say

00:06:20.714 --> 00:06:21.514
all of these

00:06:22.474 --> 00:06:25.034
paths essentially are exposed via workers.

00:06:25.114 --> 00:06:26.874
Because right now what's happening is

00:06:27.704 --> 00:06:30.144
requests that are being made from the actual

00:06:30.144 --> 00:06:30.904
browser itself.

00:06:30.904 --> 00:06:32.824
It's able to directly hit trpc.

00:06:32.904 --> 00:06:35.344
But if you were to try to load the TRPC routes or

00:06:35.344 --> 00:06:37.384
the socket route inside of a,

00:06:37.874 --> 00:06:38.834
inside of your browser,

00:06:39.234 --> 00:06:40.194
this wouldn't work.

00:06:40.354 --> 00:06:44.074
And the authentication redirect URLs basically go

00:06:44.074 --> 00:06:46.554
from Google to the browser and that's how those

00:06:46.554 --> 00:06:47.714
authentication routes happen.

00:06:47.794 --> 00:06:48.194
So

00:06:48.434 --> 00:06:49.434
this is just something that,

00:06:49.434 --> 00:06:51.314
this is a feature that cloudflare rolled out.

00:06:51.314 --> 00:06:53.794
So instead of like trying to find these in a

00:06:53.794 --> 00:06:54.634
static asset,

00:06:54.634 --> 00:06:56.474
we kind of talked about this at the very beginning

00:06:56.474 --> 00:06:56.994
of the course.

00:06:57.314 --> 00:06:59.314
We're going to go ahead and say run worker first

00:06:59.394 --> 00:07:01.394
and we're going to pass in these paths.

00:07:01.474 --> 00:07:04.434
So anything that is API auth

00:07:05.074 --> 00:07:05.474
star

00:07:05.902 --> 00:07:06.702
is going to

00:07:08.402 --> 00:07:10.162
we're going to want to make sure we proxy it

00:07:10.162 --> 00:07:11.202
anything that is

00:07:11.842 --> 00:07:12.962
TRPC

00:07:13.362 --> 00:07:14.402
forward slash star,

00:07:14.882 --> 00:07:16.562
we're going to want to make sure the worker runs

00:07:16.562 --> 00:07:16.882
first

00:07:17.522 --> 00:07:19.762
and then also this client socket,

00:07:19.762 --> 00:07:21.482
we're going to want to make sure that the worker

00:07:21.482 --> 00:07:22.162
runs first.

00:07:23.737 --> 00:07:24.390
Alrighty.

00:07:24.950 --> 00:07:25.830
So from here

00:07:26.234 --> 00:07:27.254
we can open up this

00:07:27.724 --> 00:07:29.804
page and you're going to notice if you click on

00:07:29.804 --> 00:07:30.444
start for free,

00:07:30.444 --> 00:07:32.684
you get this Google pop up and nothing happens.

00:07:32.684 --> 00:07:33.884
And that's just because I've

00:07:34.184 --> 00:07:37.384
created a like some dummy logic on top of this.

00:07:37.544 --> 00:07:37.944
Now

00:07:38.424 --> 00:07:39.904
inside of our source

00:07:40.304 --> 00:07:43.744
we're going to have a section under components and

00:07:43.744 --> 00:07:44.064
auth

00:07:44.624 --> 00:07:45.024
and

00:07:45.584 --> 00:07:48.224
inside of here we've created a better auth client.

00:07:48.224 --> 00:07:50.304
This is coming from better auth react.

00:07:50.304 --> 00:07:52.464
So this is giving us like react hooks,

00:07:53.044 --> 00:07:54.194
and we have a better off client.

00:07:54.194 --> 00:07:55.954
Now there are things that you can pass in here to

00:07:55.954 --> 00:07:56.874
configure like

00:07:57.294 --> 00:07:58.974
like a base URL for example.

00:07:58.974 --> 00:08:00.734
So if you have a server that

00:08:01.224 --> 00:08:03.824
is living somewhere else other than your UI and

00:08:03.824 --> 00:08:05.064
it's like it's of a different host,

00:08:05.064 --> 00:08:06.704
you can pass in a base URL.

00:08:06.704 --> 00:08:10.344
But because our auth is living on the same origin

00:08:10.344 --> 00:08:11.624
as our server,

00:08:11.704 --> 00:08:12.904
we're not going to worry about that.

00:08:12.904 --> 00:08:14.904
We just have to literally just you know,

00:08:14.904 --> 00:08:15.374
have this

00:08:15.374 --> 00:08:18.324
auth client and then inside of the

00:08:18.614 --> 00:08:19.564
login pop up.

00:08:19.564 --> 00:08:21.524
I have this dummy logic.

00:08:21.524 --> 00:08:24.044
It's just this dummy auth client and

00:08:24.444 --> 00:08:25.724
go ahead and delete that.

00:08:26.125 --> 00:08:27.325
And then wherever it's used

00:08:27.645 --> 00:08:28.445
we can just

00:08:29.005 --> 00:08:30.245
make sure it's imported.

00:08:30.245 --> 00:08:32.685
So it's going to import the auth client from the

00:08:32.685 --> 00:08:33.165
top here.

00:08:33.725 --> 00:08:35.190
Same with the user icon

00:08:35.190 --> 00:08:36.326
we can do the same thing,

00:08:36.326 --> 00:08:37.726
delete this auth client,

00:08:37.726 --> 00:08:38.966
this mock auth client

00:08:39.766 --> 00:08:42.006
and we'll just make sure we have this imported.

00:08:42.886 --> 00:08:44.726
And essentially what this is doing is it's

00:08:44.726 --> 00:08:45.606
basically saying

00:08:45.746 --> 00:08:47.481
I guess we can start with this login pop up.

00:08:47.771 --> 00:08:50.051
essentially what happens is this auth client gives

00:08:50.051 --> 00:08:51.651
us some different like hooks that we can latch

00:08:51.651 --> 00:08:51.931
into.

00:08:52.011 --> 00:08:52.411
So

00:08:52.691 --> 00:08:55.071
we have a sign in with Google button right here

00:08:55.391 --> 00:08:57.871
and when that gets clicked it's going to trigger

00:08:57.951 --> 00:08:58.351
this

00:08:59.091 --> 00:09:01.971
this pop up right here and the sign in with Google

00:09:02.291 --> 00:09:04.371
all we have to literally do is say auth client

00:09:04.771 --> 00:09:06.051
sign in social,

00:09:06.371 --> 00:09:09.011
we pass in the provider that we want Google and

00:09:09.011 --> 00:09:10.051
then the callback URL.

00:09:10.051 --> 00:09:12.611
So basically it's going to navigate to the app.

00:09:13.011 --> 00:09:13.411
So

00:09:13.891 --> 00:09:15.051
basically how the

00:09:15.871 --> 00:09:17.391
the sign in with Google code is.

00:09:17.391 --> 00:09:17.991
It's like very,

00:09:17.991 --> 00:09:19.551
very limited the amount of stuff that you have to

00:09:19.551 --> 00:09:20.431
write on the client side.

00:09:20.931 --> 00:09:23.191
and then a user icon is kind of similar we

00:09:23.271 --> 00:09:24.071
essentially

00:09:24.391 --> 00:09:24.791
have

00:09:26.051 --> 00:09:27.771
where we're pulling in some of the users

00:09:27.771 --> 00:09:28.051
information.

00:09:28.467 --> 00:09:31.576
So you can see here we have client Auth and client

00:09:31.576 --> 00:09:33.056
Auth has a use session.

00:09:33.056 --> 00:09:35.136
So this is a react hook that you can latch onto

00:09:35.136 --> 00:09:37.056
and that will give us like some information.

00:09:37.456 --> 00:09:39.336
So it's going to go to the session and collect

00:09:39.336 --> 00:09:39.776
some data.

00:09:40.466 --> 00:09:42.426
it'll let us know if like it's currently loading

00:09:42.426 --> 00:09:42.826
or not.

00:09:42.826 --> 00:09:44.546
And then you can get the

00:09:44.636 --> 00:09:45.806
data which we're calling user.

00:09:45.806 --> 00:09:47.486
And this has information about the user,

00:09:47.486 --> 00:09:49.646
like the email when they were created,

00:09:49.646 --> 00:09:52.436
an image if their profile has one and then some

00:09:52.666 --> 00:09:53.626
information about the session.

00:09:53.626 --> 00:09:55.186
So then we use that and I'll show you exactly

00:09:55.186 --> 00:09:55.866
where we use that.

00:09:55.866 --> 00:09:58.666
But what we can do here is we can click on

00:10:00.226 --> 00:10:01.866
we can click on Continue with Google.

00:10:01.866 --> 00:10:03.226
I just want to open this network tab.

00:10:03.226 --> 00:10:05.626
You're going to notice a request is going to fire

00:10:05.626 --> 00:10:07.426
off to our API.

00:10:07.771 --> 00:10:08.658
I'm going to do that one more time.

00:10:08.658 --> 00:10:09.578
I didn't have it up.

00:10:09.578 --> 00:10:09.834
So

00:10:09.834 --> 00:10:10.632
we click on this,

00:10:10.792 --> 00:10:12.579
a request fires off to our API.

00:10:12.579 --> 00:10:14.402
This goes to API authentication,

00:10:14.528 --> 00:10:15.248
our API.

00:10:15.248 --> 00:10:18.208
So our server redirects to

00:10:18.648 --> 00:10:19.528
Google's Auth

00:10:20.008 --> 00:10:22.208
and there is a callback URL in here that comes

00:10:22.208 --> 00:10:22.968
back to our app.

00:10:23.368 --> 00:10:25.048
We can just come into here and say I'm going to

00:10:25.048 --> 00:10:26.216
sign in with Matthew Sessions.

00:10:26.216 --> 00:10:26.524
Continue.

00:10:26.924 --> 00:10:29.924
This will redirect back to our app and then our

00:10:29.924 --> 00:10:31.164
app is basically going to say okay,

00:10:31.164 --> 00:10:32.884
go to forward slash app because that's where our

00:10:32.884 --> 00:10:33.724
dashboard is.

00:10:35.028 --> 00:10:35.508
Alrighty.

00:10:35.508 --> 00:10:38.268
So now we are going back to our app and things are

00:10:38.268 --> 00:10:38.628
loaded.

00:10:39.028 --> 00:10:39.508
All right,

00:10:39.508 --> 00:10:40.748
so our dashboard loaded.

00:10:40.748 --> 00:10:43.428
And what you're going to notice now we also have

00:10:43.428 --> 00:10:43.988
our little

00:10:44.388 --> 00:10:45.468
user client down here.

00:10:45.468 --> 00:10:45.748
It's,

00:10:45.748 --> 00:10:47.428
it's kind of blocked by this tanstack router

00:10:47.428 --> 00:10:47.588
thing,

00:10:47.588 --> 00:10:49.468
but it shows your name and your email and you can

00:10:49.468 --> 00:10:51.028
click on it and you can manage your logout.

00:10:51.028 --> 00:10:51.508
So it's very,

00:10:51.508 --> 00:10:51.988
very simple.

00:10:51.988 --> 00:10:54.148
But you can see like these components are really

00:10:54.148 --> 00:10:54.628
nice looking.

00:10:54.628 --> 00:10:55.388
They kind of

00:10:55.708 --> 00:10:57.788
work cleanly with your existing UI

00:10:58.188 --> 00:11:00.068
and you can build whatever you want on top of it

00:11:00.068 --> 00:11:01.628
if you want to be able to manage payments and

00:11:01.788 --> 00:11:02.268
whatnot.

00:11:02.268 --> 00:11:04.148
If you want a dedicated page for managing the

00:11:04.148 --> 00:11:04.428
account,

00:11:04.668 --> 00:11:05.778
it's entirely up to you.

00:11:05.928 --> 00:11:06.728
You want to implement it.

00:11:06.728 --> 00:11:09.135
Now one thing I want to do here is when the user

00:11:09.135 --> 00:11:11.175
clicks sign out I want to make sure we kind of

00:11:11.175 --> 00:11:13.175
navigate them back to the home page.

00:11:13.415 --> 00:11:13.815
So

00:11:14.165 --> 00:11:17.435
if we come to our user icon there's going to be a

00:11:17.435 --> 00:11:18.155
log out,

00:11:19.290 --> 00:11:22.290
a handle logout method and essentially what we can

00:11:22.290 --> 00:11:26.410
do is we can say const nav and we can import a use

00:11:26.890 --> 00:11:29.940
navigation or use navigate from our tan stack

00:11:30.170 --> 00:11:30.468
router

00:11:30.468 --> 00:11:31.022
and then

00:11:31.422 --> 00:11:34.622
when the auth client.sign out is successful,

00:11:34.622 --> 00:11:36.862
instead of just like reloading the page which is

00:11:36.862 --> 00:11:38.462
just something we had hard coded in here,

00:11:38.702 --> 00:11:41.454
we can go nav2

00:11:41.454 --> 00:11:43.703
nav2 and we'll just go home.

00:11:44.870 --> 00:11:47.030
Now from here I'm going to go ahead and click on

00:11:47.030 --> 00:11:47.350
this guy

00:11:47.350 --> 00:11:50.015
sign out and when it signs out it comes over here.

00:11:50.095 --> 00:11:50.655
Now what,

00:11:50.835 --> 00:11:53.395
what we're also going to notice is the forward

00:11:53.395 --> 00:11:53.955
slash

00:11:54.515 --> 00:11:54.915
app

00:11:55.180 --> 00:11:57.140
is not protected because we're currently logged

00:11:57.140 --> 00:11:57.340
out.

00:11:57.340 --> 00:11:57.660
Right.

00:11:57.960 --> 00:12:00.300
we shouldn't be able to access this page when

00:12:00.300 --> 00:12:01.060
we're logged out.

00:12:01.140 --> 00:12:01.540
So

00:12:01.860 --> 00:12:03.940
another thing that we can do is we can actually

00:12:03.940 --> 00:12:04.580
modify

00:12:04.939 --> 00:12:08.940
the Tanstack router itself to check the session on

00:12:08.940 --> 00:12:11.580
the backend if the user is authenticated or not.

00:12:12.300 --> 00:12:14.860
So under source let's head over to

00:12:16.530 --> 00:12:16.850
routes

00:12:17.730 --> 00:12:20.610
and inside of app we actually have this root level

00:12:20.690 --> 00:12:21.810
auth folder.

00:12:21.970 --> 00:12:23.810
This root level auth folder is called

00:12:24.130 --> 00:12:26.610
before every single like render or load.

00:12:26.930 --> 00:12:29.850
For anything that shows as app or any of these

00:12:29.850 --> 00:12:31.090
like parent or

00:12:31.490 --> 00:12:34.850
children pages like app dot links evaluations,

00:12:35.100 --> 00:12:36.130
these are all going to

00:12:36.450 --> 00:12:37.730
basically be

00:12:38.820 --> 00:12:42.650
be handled by this authentic.ts this root file

00:12:42.810 --> 00:12:44.890
before it comes into all of these different

00:12:44.890 --> 00:12:45.370
routes.

00:12:45.433 --> 00:12:46.873
So in order to handle this

00:12:47.273 --> 00:12:48.473
inside of our route

00:12:49.113 --> 00:12:50.473
we can add a

00:12:50.793 --> 00:12:54.153
before load function which basically is going to

00:12:54.153 --> 00:12:55.833
trigger this code before it loads

00:12:56.153 --> 00:12:57.913
and we can basically say const

00:12:58.633 --> 00:12:59.193
session

00:12:59.913 --> 00:13:01.193
equals await.

00:13:02.696 --> 00:13:02.716
We'll

00:13:02.966 --> 00:13:03.526
say off

00:13:04.506 --> 00:13:07.506
client.get session.

00:13:07.506 --> 00:13:09.626
So this is going to reach out to our backend to

00:13:09.626 --> 00:13:10.746
collect that session

00:13:11.146 --> 00:13:12.186
and then we can go

00:13:12.606 --> 00:13:12.926
if

00:13:13.406 --> 00:13:15.246
there is no actual session.

00:13:15.246 --> 00:13:15.466
So

00:13:15.466 --> 00:13:16.194
I think we should.

00:13:16.354 --> 00:13:16.794
Yeah,

00:13:16.794 --> 00:13:18.034
so we can basically say

00:13:18.544 --> 00:13:19.664
we'll call the session data

00:13:19.670 --> 00:13:20.810
Now we can just call a session.

00:13:20.970 --> 00:13:23.370
So I'm basically going to say if there is no

00:13:24.090 --> 00:13:27.940
session.data.

00:13:27.940 --> 00:13:28.500
session

00:13:29.620 --> 00:13:31.220
then we can throw

00:13:31.540 --> 00:13:31.940
a

00:13:33.220 --> 00:13:33.860
redirect

00:13:34.900 --> 00:13:36.260
from Tanstack router

00:13:36.660 --> 00:13:38.660
and we'll just basically go to

00:13:39.220 --> 00:13:40.020
back to home.

00:13:40.100 --> 00:13:42.340
So this is just going to force us back to home if

00:13:42.420 --> 00:13:43.940
the user is not authenticated.

00:13:43.940 --> 00:13:44.740
So currently

00:13:45.140 --> 00:13:46.580
I am not authenticated.

00:13:46.580 --> 00:13:48.980
So if we actually load this page notice it takes

00:13:48.980 --> 00:13:51.940
us back to app and if we try to go there again

00:13:53.050 --> 00:13:54.170
it's not going to let us do that.

00:13:54.170 --> 00:13:56.090
That's kind of the expected behavior here.

00:13:56.330 --> 00:13:57.970
So we'll go ahead and go through the sign in

00:13:57.970 --> 00:13:58.250
process.

00:13:58.452 --> 00:13:59.012
Alright,

00:13:59.012 --> 00:14:00.506
so now it's taken us back to app

00:14:00.584 --> 00:14:02.264
and if we go back home

00:14:02.662 --> 00:14:04.182
we just go back to the home page.

00:14:04.902 --> 00:14:07.302
We also have Our little icon that renders up here,

00:14:07.312 --> 00:14:08.722
you can go through the front end code and just

00:14:08.722 --> 00:14:10.362
kind of play around with it to see how this is.

00:14:10.492 --> 00:14:11.302
but yeah,

00:14:11.302 --> 00:14:11.822
so we have

00:14:12.122 --> 00:14:13.402
like a little icon here

00:14:13.492 --> 00:14:15.142
that we can click on and we can log out.

00:14:15.142 --> 00:14:17.422
So from here when we do start for free,

00:14:17.422 --> 00:14:19.262
if we're already logged in it's just going to take

00:14:19.262 --> 00:14:19.814
us to the app

00:14:19.834 --> 00:14:20.234
and

00:14:20.714 --> 00:14:22.234
if we sign out

00:14:22.794 --> 00:14:24.754
this button is basically going to have this pop up

00:14:24.754 --> 00:14:25.034
again.

00:14:25.034 --> 00:14:25.434
So

00:14:25.584 --> 00:14:26.594
go through the front end code,

00:14:26.594 --> 00:14:28.434
just pay attention to the hooks because all of

00:14:28.434 --> 00:14:30.554
these components are using the Better Auth hooks

00:14:30.554 --> 00:14:31.874
to basically build out this logic.

00:14:31.874 --> 00:14:32.194
But

00:14:32.524 --> 00:14:34.474
I hope that this is kind of like a really good

00:14:34.474 --> 00:14:35.634
overview of how to integrate.

00:14:35.634 --> 00:14:37.354
So at this point you know we've built out our

00:14:37.354 --> 00:14:39.274
entire integration with Better Auth.

00:14:39.274 --> 00:14:40.834
We have created our tables,

00:14:41.304 --> 00:14:42.804
we integrated the

00:14:43.264 --> 00:14:45.784
the backend client with our backend application.

00:14:45.784 --> 00:14:48.424
We created some client credentials on Google and

00:14:48.424 --> 00:14:49.344
then we've also

00:14:49.694 --> 00:14:52.174
wired in like the client hooks into our user like

00:14:52.334 --> 00:14:54.094
application on the UI side of things.

00:14:54.174 --> 00:14:56.094
So everything's kind of working cohesively.

00:14:56.174 --> 00:14:57.814
Last thing we're going to do is let's get this

00:14:57.814 --> 00:14:59.534
thing wired up with our actual domain.

00:15:00.014 --> 00:15:02.574
So we have this site smartlink.com

00:15:02.974 --> 00:15:05.414
and what we're going to want to do is we're going

00:15:05.414 --> 00:15:07.054
to want to head over to our,

00:15:08.551 --> 00:15:10.391
head over to our Google Auth again

00:15:10.550 --> 00:15:10.950
and

00:15:11.830 --> 00:15:14.870
we will modify this so you can come in here.

00:15:14.870 --> 00:15:17.110
We can also add this callback so basically

00:15:17.430 --> 00:15:19.310
everything at Smart Link and you can do this for

00:15:19.310 --> 00:15:21.550
your lower environments for your stage URL as

00:15:21.550 --> 00:15:21.830
well.

00:15:21.910 --> 00:15:24.190
You can also use your cloudflare generated domain

00:15:24.190 --> 00:15:25.190
if you wanted to here.

00:15:25.320 --> 00:15:27.610
so then I'm just going to say grab this,

00:15:27.690 --> 00:15:28.970
I'm going to copy the

00:15:29.510 --> 00:15:30.110
this section.

00:15:30.110 --> 00:15:30.470
So

00:15:30.760 --> 00:15:33.390
smartlink.com API auth callback Google.

00:15:33.390 --> 00:15:33.870
Okay,

00:15:33.950 --> 00:15:35.070
I'm going to save that

00:15:35.095 --> 00:15:37.804
now what we're going to do is I'm going to kill

00:15:37.804 --> 00:15:39.764
this and we're going to say pnpm,

00:15:39.764 --> 00:15:40.124
run,

00:15:42.924 --> 00:15:43.644
production,

00:15:43.724 --> 00:15:44.284
deploy.

00:15:44.931 --> 00:15:46.758
And while this is loading I'm going to head over

00:15:46.758 --> 00:15:49.078
to our cloudflare dashboard and I'm going to go to

00:15:49.078 --> 00:15:51.318
that specific worker so we can head over to our

00:15:51.318 --> 00:15:51.598
workers

00:15:51.778 --> 00:15:52.662
user application

00:15:52.662 --> 00:15:53.284
settings

00:15:53.764 --> 00:15:55.204
and then we're going to add

00:15:55.844 --> 00:15:56.124
our

00:15:56.584 --> 00:15:58.624
Google environment variables here as well.

00:15:58.624 --> 00:16:00.894
So notice that we set up our emv,

00:16:00.894 --> 00:16:02.806
we have our EMV file right here.

00:16:03.686 --> 00:16:06.406
We're going to put these inside of our

00:16:06.806 --> 00:16:07.926
variables and secrets.

00:16:07.926 --> 00:16:09.686
Now this differs from the

00:16:10.266 --> 00:16:12.306
the variables and secrets during the build

00:16:12.306 --> 00:16:12.666
process.

00:16:12.986 --> 00:16:14.586
These are runtime secrets.

00:16:14.666 --> 00:16:16.866
So these will have access to when the actual

00:16:16.866 --> 00:16:18.506
worker is invoked so we can add.

00:16:18.806 --> 00:16:19.126
Guys,

00:16:19.366 --> 00:16:20.726
we're going to make sure that's a secret.

00:16:20.966 --> 00:16:22.006
Make sure that's a secret.

00:16:22.059 --> 00:16:23.775
And then we're going to deploy that one more time.

00:16:24.003 --> 00:16:25.463
Reload smartlinks.com

00:16:25.463 --> 00:16:25.899
all right,

00:16:25.899 --> 00:16:27.669
let's see if Auth is working as expected.

00:16:28.149 --> 00:16:28.709
Boom.

00:16:28.949 --> 00:16:31.060
Sign in should take us back to here.

00:16:31.060 --> 00:16:31.433
Cool.

00:16:31.433 --> 00:16:32.153
This is working.

00:16:32.873 --> 00:16:33.993
We want to do.

00:16:34.313 --> 00:16:34.673
Actually,

00:16:34.673 --> 00:16:35.113
let's.

00:16:35.583 --> 00:16:35.783
Yeah.

00:16:35.783 --> 00:16:36.494
So let's log out

00:16:36.494 --> 00:16:38.147
and let's try to go to our app

00:16:38.947 --> 00:16:40.787
and we are not able to see anything.

00:16:40.867 --> 00:16:41.347
Cool.

00:16:41.667 --> 00:16:43.467
So Auth is fully built out at this point.

00:16:43.467 --> 00:16:45.307
We've been able to validate everything locally.

00:16:45.307 --> 00:16:46.787
We've also also been able to,

00:16:47.537 --> 00:16:49.657
roll out our Auth for the actual production

00:16:49.657 --> 00:16:51.377
version of our application with the domain that

00:16:51.377 --> 00:16:51.617
we,

00:16:51.617 --> 00:16:52.257
that we own.

00:16:52.337 --> 00:16:52.737
So.

00:16:52.977 --> 00:16:53.377
Yeah,

00:16:53.377 --> 00:16:54.377
so in this next section,

00:16:54.377 --> 00:16:56.057
we're going to also figure out how to,

00:16:56.057 --> 00:16:56.257
like,

00:16:56.257 --> 00:16:58.064
actually work the payment side of things as well.

