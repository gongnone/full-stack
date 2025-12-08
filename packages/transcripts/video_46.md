WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.039 --> 00:00:00.359
All right,

00:00:00.359 --> 00:00:02.639
so now that we've validated the websocket

00:00:02.639 --> 00:00:04.479
connection and that all of the features around

00:00:04.479 --> 00:00:05.639
that are working as expected,

00:00:06.199 --> 00:00:08.839
let's connect the front end application,

00:00:08.839 --> 00:00:10.359
the user facing application

00:00:10.919 --> 00:00:11.209
via

00:00:11.209 --> 00:00:13.899
service bindings to our data service so we can

00:00:13.899 --> 00:00:14.779
proxy that

00:00:14.809 --> 00:00:15.919
websocket connection.

00:00:16.079 --> 00:00:18.359
That way we're not hard coding like the actual

00:00:18.359 --> 00:00:21.479
backend URL into our client code.

00:00:21.479 --> 00:00:21.839
So

00:00:22.399 --> 00:00:23.839
first thing that we're going to do is inside of

00:00:23.839 --> 00:00:25.359
data service I have

00:00:26.550 --> 00:00:29.354
I have inside of our Hono app basically hard coded

00:00:29.354 --> 00:00:30.274
this account id.

00:00:30.354 --> 00:00:32.274
We're not going to want to do that anymore because

00:00:32.274 --> 00:00:34.674
we're going to want everything to flow as it's

00:00:34.674 --> 00:00:35.314
supposed to.

00:00:36.274 --> 00:00:38.904
So just go ahead and make sure that this is

00:00:38.904 --> 00:00:39.527
commented

00:00:39.625 --> 00:00:40.025
as

00:00:40.295 --> 00:00:40.845
correctly.

00:00:40.925 --> 00:00:43.045
We're grabbing account ID from the header now

00:00:43.045 --> 00:00:46.525
let's go ahead and clear PNPM run deploy our

00:00:46.525 --> 00:00:47.245
backend service.

00:00:47.573 --> 00:00:49.413
Now as for the front end service,

00:00:49.653 --> 00:00:52.693
what I'm going to do is I'm actually going to open

00:00:52.693 --> 00:00:55.973
this guy in a new cursor window just because it's

00:00:55.973 --> 00:00:57.763
going to be easier to navigate.

00:00:57.763 --> 00:00:59.653
we're not going to really touch the data service

00:00:59.813 --> 00:01:01.733
in this aspect of our

00:01:01.913 --> 00:01:02.673
in this section.

00:01:02.673 --> 00:01:03.753
So let's go ahead and say

00:01:04.153 --> 00:01:05.033
cursor.

00:01:05.593 --> 00:01:07.113
You also don't have to do this.

00:01:07.113 --> 00:01:07.593
This is just,

00:01:07.593 --> 00:01:08.473
this is totally optional.

00:01:08.473 --> 00:01:10.873
I just kind of like doing this because it's a

00:01:10.873 --> 00:01:12.313
little bit easier to work with.

00:01:12.553 --> 00:01:12.953
So

00:01:13.603 --> 00:01:15.043
I'm going to make sure that we can

00:01:17.043 --> 00:01:18.803
make this a bit bigger so you can see.

00:01:19.213 --> 00:01:19.523
okay,

00:01:19.523 --> 00:01:20.683
I'm going to close all of these.

00:01:20.899 --> 00:01:21.864
All right now

00:01:22.184 --> 00:01:24.304
what we're going to want to do is just kind of

00:01:24.304 --> 00:01:26.984
like talk through the data flow really quick.

00:01:27.064 --> 00:01:27.464
So

00:01:28.958 --> 00:01:31.438
so essentially we have our,

00:01:32.078 --> 00:01:34.278
we have this Hono application which actually is

00:01:34.278 --> 00:01:36.438
connected to our durable object and has the web

00:01:36.438 --> 00:01:36.958
sockets.

00:01:37.788 --> 00:01:41.148
Now currently we kind of hard coded the URL to

00:01:41.228 --> 00:01:43.628
this service and then it moved over to this

00:01:43.628 --> 00:01:45.708
durable object for the state management.

00:01:46.188 --> 00:01:48.268
What we're going to want to do is basically this

00:01:48.268 --> 00:01:50.388
TRPC side of our application.

00:01:50.388 --> 00:01:51.863
I think we have a better diagram here.

00:01:51.941 --> 00:01:54.261
We're basically going to want to have this layer

00:01:54.261 --> 00:01:55.701
do all of the authentication.

00:01:55.951 --> 00:01:57.841
so later we're actually going to build out an auth

00:01:57.841 --> 00:01:58.921
layer with better auth,

00:01:58.921 --> 00:02:00.671
so we can do sign in with Google and stuff.

00:02:00.671 --> 00:02:02.381
and then we're going to just move that connection

00:02:02.381 --> 00:02:04.701
proxy that connection over to our data service and

00:02:04.701 --> 00:02:06.061
we can do this via service bindings,

00:02:06.061 --> 00:02:08.801
meaning we don't have to like have our hard coded

00:02:09.121 --> 00:02:12.841
data service URL inside of this code and then you

00:02:12.841 --> 00:02:13.081
know,

00:02:13.081 --> 00:02:14.441
do a fetch call to it.

00:02:14.441 --> 00:02:16.481
We can actually just rely on a binding.

00:02:16.561 --> 00:02:19.841
So what this looks like is if we head over to

00:02:20.542 --> 00:02:22.110
if we head over to our

00:02:23.186 --> 00:02:24.706
wrangler JSON C,

00:02:24.946 --> 00:02:27.466
a service binding is another configuration inside

00:02:27.466 --> 00:02:30.226
of here where we can basically say we want our,

00:02:30.866 --> 00:02:31.826
we want our service,

00:02:32.066 --> 00:02:34.106
the one that we're currently working on to depend

00:02:34.106 --> 00:02:34.986
on another service.

00:02:34.986 --> 00:02:37.466
And in this situation it's just literally going to

00:02:37.466 --> 00:02:37.746
be

00:02:38.626 --> 00:02:39.026
our

00:02:39.826 --> 00:02:40.626
data service.

00:02:40.866 --> 00:02:43.106
So inside of here I'm just going to put in

00:02:44.866 --> 00:02:46.546
the binding is going to be back in service.

00:02:47.106 --> 00:02:50.186
The service name is the name inside of our data

00:02:50.186 --> 00:02:51.146
service that we've defined.

00:02:51.146 --> 00:02:52.466
So we call this data service.

00:02:52.706 --> 00:02:55.866
So you notice the name user application.

00:02:55.866 --> 00:02:57.946
Right now we're working in our user application we

00:02:57.946 --> 00:02:59.626
are now binding to our data service.

00:02:59.626 --> 00:03:01.346
So this is the name in the wrangler file.

00:03:01.346 --> 00:03:03.566
And then I'm also just doing a experimental remote

00:03:03.566 --> 00:03:05.526
because we've technically already deployed our

00:03:05.526 --> 00:03:08.286
data service so that's all running so we can

00:03:08.366 --> 00:03:10.846
actually connect to the deployed version

00:03:10.866 --> 00:03:11.756
when running locally,

00:03:11.756 --> 00:03:12.236
which is really,

00:03:12.236 --> 00:03:12.676
really cool.

00:03:12.676 --> 00:03:13.636
It didn't used to be that,

00:03:13.636 --> 00:03:14.396
that easy.

00:03:14.506 --> 00:03:16.714
next thing that we're going to do is we are going

00:03:16.714 --> 00:03:19.674
to say pnpm run CF type gin.

00:03:20.074 --> 00:03:22.674
This is going to generate a binding for our data

00:03:22.674 --> 00:03:23.034
service.

00:03:23.114 --> 00:03:24.874
Now if we head over to our

00:03:25.964 --> 00:03:28.164
worker configuration you're going to see that the

00:03:28.164 --> 00:03:30.245
backend service is literally just a fetcher.

00:03:31.562 --> 00:03:33.682
So interfacing with it is actually very very easy.

00:03:33.682 --> 00:03:34.022
and I'll,

00:03:34.022 --> 00:03:35.622
and we'll get to that in just a second.

00:03:35.862 --> 00:03:38.542
One other call out that I wanted to make is you

00:03:38.542 --> 00:03:39.862
notice inside of our worker.

00:03:39.862 --> 00:03:42.342
So this is the backend code of our user facing

00:03:42.342 --> 00:03:42.902
application.

00:03:43.062 --> 00:03:44.221
We just have this really,

00:03:44.221 --> 00:03:46.662
really simple fetch handler and this fetch handler

00:03:46.662 --> 00:03:47.222
is just

00:03:47.622 --> 00:03:50.342
looking if it's TRPC and then proxying that stuff

00:03:50.342 --> 00:03:51.102
to trpc.

00:03:51.102 --> 00:03:52.902
Now what we're also going to want to do is we're

00:03:52.902 --> 00:03:55.382
also going to want to like find our forward slash

00:03:55.542 --> 00:03:56.662
click socket.

00:03:56.662 --> 00:03:57.062
So

00:03:57.462 --> 00:03:57.942
click.

00:04:01.532 --> 00:04:03.172
And we're going to want to route everything from

00:04:03.172 --> 00:04:05.652
the click socket and we're going to proxy it to

00:04:05.652 --> 00:04:06.012
our

00:04:06.562 --> 00:04:08.282
to our data service and we're going to do a little

00:04:08.282 --> 00:04:08.762
bit more there.

00:04:08.762 --> 00:04:10.602
We're going to probably do some authentication and

00:04:10.602 --> 00:04:12.362
we're also going to like make sure we have the

00:04:12.362 --> 00:04:13.362
header set correctly.

00:04:13.362 --> 00:04:13.762
So

00:04:14.402 --> 00:04:17.642
what I like because this was just a really generic

00:04:17.642 --> 00:04:18.242
fetch handler,

00:04:18.242 --> 00:04:20.202
which is one thing in here I thought it was fine,

00:04:20.202 --> 00:04:21.682
let's just have it as a fetch handler.

00:04:21.682 --> 00:04:24.242
But now that we're actually doing like URL path

00:04:24.242 --> 00:04:25.202
name starts with this.

00:04:25.282 --> 00:04:27.522
URL path name starts with client socket.

00:04:27.602 --> 00:04:29.522
We're going to actually probably want to move this

00:04:29.522 --> 00:04:32.822
to a mesh managed way of doing routes and we can

00:04:32.822 --> 00:04:33.822
do that with Hono.

00:04:33.822 --> 00:04:35.022
So if you notice,

00:04:35.022 --> 00:04:37.062
in our data service we have our Hono application

00:04:37.062 --> 00:04:39.502
with all these routes defined and then we have our

00:04:39.502 --> 00:04:42.102
index and basically our fetch is just passing that

00:04:42.102 --> 00:04:43.182
data right off to

00:04:43.752 --> 00:04:44.432
fetch handler.

00:04:44.432 --> 00:04:45.872
And then we have a

00:04:46.192 --> 00:04:47.832
and we have Init db.

00:04:47.832 --> 00:04:50.112
Now this is actually extending a worker entry

00:04:50.112 --> 00:04:50.432
point.

00:04:50.752 --> 00:04:51.912
Totally fine way of doing it.

00:04:51.912 --> 00:04:53.232
This is my preferred way of doing it.

00:04:53.232 --> 00:04:56.152
In our client application we could do it the same

00:04:56.152 --> 00:04:56.352
way.

00:04:56.352 --> 00:04:57.712
We could do it exactly this way,

00:04:57.952 --> 00:04:59.812
but we could also just have like this,

00:04:59.962 --> 00:05:01.762
this fetch handler exported with no

00:05:01.762 --> 00:05:02.402
function Object() { [native code] }.

00:05:02.402 --> 00:05:03.042
Totally fine.

00:05:03.042 --> 00:05:04.922
So I'm just going to show this pattern for this

00:05:04.922 --> 00:05:05.402
example.

00:05:05.642 --> 00:05:07.802
Now I've already created this Hono app,

00:05:07.962 --> 00:05:08.722
very simple.

00:05:08.722 --> 00:05:10.282
Right now it's just looking

00:05:10.762 --> 00:05:12.173
everything at TRPC

00:05:12.173 --> 00:05:14.577
is going to route into this fetch handler right

00:05:14.577 --> 00:05:14.857
here.

00:05:15.337 --> 00:05:15.737
And

00:05:16.287 --> 00:05:18.527
it's doing the exact same thing that we're doing

00:05:18.527 --> 00:05:18.754
here.

00:05:18.754 --> 00:05:21.518
And then we're also going to add this click

00:05:21.518 --> 00:05:22.118
socket.

00:05:22.118 --> 00:05:23.948
Now what you're going to notice here is,

00:05:24.378 --> 00:05:25.738
I am grabbing some,

00:05:25.898 --> 00:05:27.258
I'm creating a headers,

00:05:27.778 --> 00:05:28.178
object.

00:05:28.418 --> 00:05:29.898
Then I'm setting account id.

00:05:29.898 --> 00:05:31.658
Right now we're still setting it manually because

00:05:31.658 --> 00:05:33.618
we haven't built out that authentication logic.

00:05:33.778 --> 00:05:36.338
And then I am creating a new request where I'm

00:05:36.338 --> 00:05:38.778
passing in the request that we received from the

00:05:38.778 --> 00:05:39.218
client

00:05:39.698 --> 00:05:41.378
into this new request object.

00:05:41.538 --> 00:05:43.898
And then also I'm passing in those headers and

00:05:43.898 --> 00:05:45.498
then this is where that binding happens.

00:05:45.498 --> 00:05:47.138
So instead of like just saying fetch

00:05:47.458 --> 00:05:50.338
or Axios or whatever your preferred fetch library

00:05:50.338 --> 00:05:50.658
is,

00:05:50.818 --> 00:05:52.018
what we're doing is we're saying,

00:05:52.158 --> 00:05:52.448
envy

00:05:52.958 --> 00:05:53.598
backend service

00:05:53.918 --> 00:05:54.478
fetch.

00:05:54.638 --> 00:05:56.838
And this is basically calling the fetch handler of

00:05:56.838 --> 00:05:57.638
our backend service.

00:05:57.638 --> 00:06:00.078
So it's literally calling this guy right here.

00:06:00.078 --> 00:06:02.078
So it's just proxying that request through.

00:06:02.078 --> 00:06:02.918
And there's very,

00:06:02.918 --> 00:06:03.198
very,

00:06:03.198 --> 00:06:05.678
very little added latency when you're doing this

00:06:05.678 --> 00:06:08.638
just because it's calling like code that's living

00:06:08.638 --> 00:06:09.518
next to each other,

00:06:09.538 --> 00:06:11.168
inside of Cloudflare's

00:06:11.488 --> 00:06:11.588
inside,

00:06:11.798 --> 00:06:13.198
of Cloudflare's like server farm.

00:06:13.278 --> 00:06:13.678
So

00:06:13.998 --> 00:06:15.998
this is all we have to do to proxy that request.

00:06:16.278 --> 00:06:18.518
and then what I'm going to do inside of our index

00:06:18.518 --> 00:06:18.975
ts,

00:06:19.036 --> 00:06:21.116
I'm just going to go ahead and say we can

00:06:21.116 --> 00:06:22.556
instantiate the database at this level,

00:06:22.556 --> 00:06:23.076
that's fine.

00:06:23.076 --> 00:06:24.316
And then I'm just going to say return

00:06:25.774 --> 00:06:29.374
app.fetch and then we'll pass in

00:06:30.564 --> 00:06:31.074
request

00:06:31.474 --> 00:06:34.834
and we'll pass in emv and we'll pass in context

00:06:35.714 --> 00:06:37.794
and it's going to mirror what we have done here.

00:06:38.594 --> 00:06:41.394
So we're just passing what's in here into here.

00:06:41.644 --> 00:06:42.694
and then this code should work.

00:06:42.694 --> 00:06:43.870
So we should be able to say,

00:06:44.146 --> 00:06:45.266
npm run

00:06:45.500 --> 00:06:45.900
dev.

00:06:46.325 --> 00:06:47.205
This should start up.

00:06:47.205 --> 00:06:49.405
And then I'm gonna also delete these guys just to

00:06:49.405 --> 00:06:50.371
clean this up a little bit.

00:06:50.912 --> 00:06:52.072
and just one thing.

00:06:52.072 --> 00:06:53.392
If you haven't set this yet,

00:06:53.872 --> 00:06:55.712
you're going to have to create a

00:06:56.032 --> 00:06:56.846
EMV file

00:06:56.846 --> 00:06:58.559
and this isn't going to be in the git repo.

00:06:58.559 --> 00:06:59.159
So you're going to say,

00:06:59.159 --> 00:07:01.639
you're going to create this EMV file at the root

00:07:01.639 --> 00:07:02.959
of your user application.

00:07:03.539 --> 00:07:04.739
Then you're going to say vite

00:07:05.219 --> 00:07:06.099
base host.

00:07:06.259 --> 00:07:06.939
For now,

00:07:06.939 --> 00:07:08.619
right now what we're going to do is we're just

00:07:08.619 --> 00:07:10.259
going to say localhost 3000

00:07:11.228 --> 00:07:13.788
and we should be able to open this guy up.

00:07:14.428 --> 00:07:15.515
Let's head over to

00:07:16.235 --> 00:07:16.635
app.

00:07:16.837 --> 00:07:19.033
I'll also inspect our network tab.

00:07:19.033 --> 00:07:19.374
Cool.

00:07:19.454 --> 00:07:19.854
So

00:07:20.204 --> 00:07:20.604
notice

00:07:21.004 --> 00:07:22.284
our client socket

00:07:22.604 --> 00:07:25.004
is actually making a request to.

00:07:25.724 --> 00:07:28.204
It's actually making a request to localhost 3000

00:07:28.280 --> 00:07:30.474
and that is being proxy to our backend service.

00:07:30.634 --> 00:07:32.554
So we are connected as we can see here.

00:07:32.794 --> 00:07:34.714
And then if I go to one of our,

00:07:34.874 --> 00:07:35.914
our URLs,

00:07:36.714 --> 00:07:38.074
it's gonna show up right there.

00:07:38.074 --> 00:07:38.794
So look at that.

00:07:38.794 --> 00:07:41.594
Now we have our little like map working.

00:07:41.754 --> 00:07:42.314
So the

00:07:42.634 --> 00:07:44.954
events are actually making its way from

00:07:45.604 --> 00:07:48.444
our link click to our backend service via

00:07:48.444 --> 00:07:49.244
WebSocket,

00:07:49.244 --> 00:07:50.404
back to our UI.

00:07:50.404 --> 00:07:51.644
So this is a really,

00:07:51.644 --> 00:07:53.844
really easy way of binding your backend to your

00:07:53.844 --> 00:07:54.244
front end.

00:07:54.244 --> 00:07:56.564
It was like such little code and honestly it's

00:07:56.564 --> 00:07:57.684
just working so perfectly.

00:07:57.684 --> 00:07:58.084
So

00:07:58.524 --> 00:07:59.284
now when you,

00:07:59.284 --> 00:08:00.284
when we deploy this,

00:08:00.284 --> 00:08:02.124
we're actually going to want to add,

00:08:02.424 --> 00:08:03.504
we're going to get into this later.

00:08:03.624 --> 00:08:05.164
we're going to be doing like DevOps.

00:08:05.624 --> 00:08:07.264
we're going to do automated deployments and stuff.

00:08:07.264 --> 00:08:08.944
We're going to manage environments in a really

00:08:08.944 --> 00:08:09.264
like,

00:08:09.264 --> 00:08:09.864
nice way.

00:08:09.864 --> 00:08:10.264
But

00:08:10.584 --> 00:08:11.384
what we're going,

00:08:11.384 --> 00:08:12.054
what we're doing

00:08:12.524 --> 00:08:13.084
right now,

00:08:13.164 --> 00:08:13.924
when we deploy,

00:08:13.924 --> 00:08:15.484
instead of deploying the local host,

00:08:15.724 --> 00:08:18.204
you're going to want to get the URL for your user

00:08:18.204 --> 00:08:18.764
application

00:08:19.084 --> 00:08:21.564
and you're going to want to put that in here as

00:08:21.564 --> 00:08:21.844
well.

00:08:21.844 --> 00:08:23.044
So I'm just going to put that here.

00:08:23.044 --> 00:08:23.404
Now

00:08:23.724 --> 00:08:26.586
this is our URL.workers.dev.

00:08:26.586 --> 00:08:27.583
URL.workers.dev.

00:08:28.550 --> 00:08:29.030
okay,

00:08:29.030 --> 00:08:31.030
so this is our base host.

00:08:32.730 --> 00:08:35.290
then we can say pnpm run deploy.

00:08:38.370 --> 00:08:40.850
You can ignore the code chunking for now,

00:08:40.850 --> 00:08:41.690
there's other ways to,

00:08:41.690 --> 00:08:41.890
like,

00:08:41.890 --> 00:08:42.670
make that smaller.

00:08:42.670 --> 00:08:44.140
you can kind of read through the documentation

00:08:44.140 --> 00:08:44.860
that they have here.

00:08:44.860 --> 00:08:45.860
This is just a warning.

00:08:45.940 --> 00:08:46.340
And

00:08:46.429 --> 00:08:47.629
now that we're deployed,

00:08:47.629 --> 00:08:48.766
we can open this guy up

00:08:49.021 --> 00:08:51.101
and let's go to our app

00:08:51.435 --> 00:08:53.281
and you can see that we're immediately connected.

00:08:53.601 --> 00:08:57.441
I'm gonna go do this redirect and take a look.

00:08:57.601 --> 00:09:00.081
We're now able to see that data pop up here in

00:09:00.081 --> 00:09:00.641
real time.

00:09:00.641 --> 00:09:01.881
So end to end,

00:09:01.881 --> 00:09:02.561
this is working.

00:09:02.651 --> 00:09:04.441
basically the entire UI is built out.

00:09:04.441 --> 00:09:05.681
The things that we do not have,

00:09:05.681 --> 00:09:07.081
which we're going to be doing towards the end of

00:09:07.081 --> 00:09:07.361
the course,

00:09:07.361 --> 00:09:07.931
is like,

00:09:08.171 --> 00:09:11.861
some of this data in our dashboard and is actually

00:09:11.861 --> 00:09:12.581
not legit.

00:09:12.581 --> 00:09:12.981
Like,

00:09:13.833 --> 00:09:15.929
like the active links here is not legit.

00:09:16.009 --> 00:09:17.329
The country breakdown,

00:09:17.329 --> 00:09:18.409
this is not legit.

00:09:18.809 --> 00:09:20.849
and I don't think that these metrics are legit,

00:09:20.849 --> 00:09:21.929
but we'll get to this later.

00:09:21.929 --> 00:09:22.329
So,

00:09:22.569 --> 00:09:23.109
for now,

00:09:23.109 --> 00:09:23.549
you know,

00:09:23.549 --> 00:09:24.029
end to end,

00:09:24.029 --> 00:09:25.029
this application is working.

00:09:25.029 --> 00:09:27.629
We have an entire ecosystem of data flow built

00:09:27.629 --> 00:09:27.909
out.

00:09:29.749 --> 00:09:30.149
And,

00:09:30.449 --> 00:09:32.409
we've implemented websockets where we're able to

00:09:32.409 --> 00:09:33.689
manage state on the back end.

00:09:33.689 --> 00:09:35.369
And just to kind of like illustrate this,

00:09:35.369 --> 00:09:37.209
let's open this guy into a new tab.

00:09:38.059 --> 00:09:38.619
New tab,

00:09:39.339 --> 00:09:40.459
reload this page.

00:09:41.179 --> 00:09:42.619
So we don't have anything,

00:09:42.939 --> 00:09:44.299
we don't have anything right now.

00:09:44.369 --> 00:09:45.779
and then I'm going to just go to

00:09:46.179 --> 00:09:46.779
that link,

00:09:46.779 --> 00:09:48.259
it's going to redirect to Google

00:09:48.659 --> 00:09:49.619
and look at that.

00:09:49.619 --> 00:09:50.979
It's cascaded to here.

00:09:51.299 --> 00:09:52.339
It's on this one

00:09:52.739 --> 00:09:53.939
and it's on this one.

00:09:54.319 --> 00:09:55.359
you were to do this on your phone,

00:09:55.359 --> 00:09:56.999
you'd also notice that that's the case.

00:09:56.999 --> 00:09:58.868
So WebSockets are working perfectly.

00:09:58.868 --> 00:09:59.259
All right,

00:09:59.259 --> 00:09:59.739
so now,

00:09:59.739 --> 00:10:01.299
before moving on to authentication,

00:10:01.299 --> 00:10:02.219
this next section,

00:10:02.219 --> 00:10:04.499
we're actually going to dive really deep into like

00:10:04.499 --> 00:10:05.739
the DevOps side of things.

00:10:05.979 --> 00:10:06.939
Automated deploy.

00:10:07.799 --> 00:10:09.679
Managing multiple versions of your application.

00:10:09.679 --> 00:10:11.839
You can have a stage and a production version

00:10:11.839 --> 00:10:13.079
version of your application,

00:10:13.239 --> 00:10:15.439
how we manage environment variables that way and

00:10:15.439 --> 00:10:15.999
so forth.

00:10:15.999 --> 00:10:17.559
So I think that this is actually a really

00:10:17.559 --> 00:10:19.159
requested aspect of the course.

00:10:19.159 --> 00:10:21.319
A lot of people don't know how to do this,

00:10:21.879 --> 00:10:23.719
like in a really good way with cloudflare.

00:10:23.719 --> 00:10:26.039
But I have a few workflows that I have built out

00:10:26.039 --> 00:10:26.359
that

00:10:26.839 --> 00:10:27.239
really,

00:10:27.419 --> 00:10:29.739
streamline the development process and allow me to

00:10:29.739 --> 00:10:30.659
develop in a safe way.

00:10:30.659 --> 00:10:32.179
So we're going to cover that before getting into

00:10:32.179 --> 00:10:32.979
the auth stuff.

00:10:32.979 --> 00:10:33.379
Oh yeah,

00:10:33.379 --> 00:10:33.899
we're also,

00:10:33.899 --> 00:10:34.779
we're going to go into,

00:10:35.969 --> 00:10:36.369
domains.

00:10:36.369 --> 00:10:37.929
So like domain routing and whatnot.

00:10:37.929 --> 00:10:39.569
So I'm going to go ahead and purchase a domain for

00:10:39.569 --> 00:10:39.969
this course,

00:10:39.969 --> 00:10:41.849
show you how to actually wire up your own domain

00:10:41.849 --> 00:10:43.169
so you're not using this anymore.

00:10:43.329 --> 00:10:44.249
And then from there,

00:10:44.249 --> 00:10:46.009
that's also going to give us the foundation to

00:10:46.009 --> 00:10:46.689
build on top of,

00:10:46.689 --> 00:10:47.809
so we can actually use,

00:10:47.839 --> 00:10:49.379
sign in with Google and better authenticity.

