WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.060 --> 00:00:00.420
All right,

00:00:00.420 --> 00:00:02.980
so now that we have a good chunk of the user

00:00:02.980 --> 00:00:04.340
facing application built out,

00:00:04.340 --> 00:00:06.260
all these crud operations are working and we're

00:00:06.260 --> 00:00:08.220
able to create smart links.

00:00:08.380 --> 00:00:10.180
We're going to move a little bit deeper back into

00:00:10.180 --> 00:00:12.980
the stack and start building out the data side of

00:00:12.980 --> 00:00:13.740
this application.

00:00:13.750 --> 00:00:16.020
the first chunk that we're going to kind of take a

00:00:16.020 --> 00:00:18.020
stab at is we're actually going to build out the

00:00:18.260 --> 00:00:19.380
smart routing system

00:00:19.780 --> 00:00:21.940
that listens to a source link,

00:00:22.450 --> 00:00:25.890
request and then routes or redirects that request

00:00:26.290 --> 00:00:27.730
to the intended destination.

00:00:27.970 --> 00:00:31.250
So if you notice here we have these links that got

00:00:31.250 --> 00:00:33.730
created whenever we would create a link through

00:00:33.730 --> 00:00:34.370
this flow

00:00:34.850 --> 00:00:36.610
and right now it says undefined.

00:00:36.610 --> 00:00:38.730
That's just because this is configured by a vite

00:00:38.730 --> 00:00:40.530
environment variable that we haven't set yet.

00:00:40.530 --> 00:00:41.970
Once we get a domain,

00:00:42.410 --> 00:00:43.550
we're going to be configuring this.

00:00:43.550 --> 00:00:46.110
So don't expect this URL to work as it stands

00:00:46.110 --> 00:00:46.550
right now.

00:00:47.710 --> 00:00:49.910
as we've kind of gone over throughout the creation

00:00:49.910 --> 00:00:50.990
of this UI is

00:00:51.560 --> 00:00:53.320
every single link has a destination.

00:00:53.800 --> 00:00:55.240
So this is kind of like the default,

00:00:55.240 --> 00:00:56.760
this is where all the traffic goes to.

00:00:56.920 --> 00:01:00.120
And then we're optionally able to configure geo

00:01:00.120 --> 00:01:01.160
based routing as well.

00:01:01.160 --> 00:01:03.760
So essentially what that's intended to do is when

00:01:03.760 --> 00:01:05.400
a smart link receives a request,

00:01:05.480 --> 00:01:07.880
it's gonna look up the configuration for that

00:01:07.880 --> 00:01:09.080
specific link ID

00:01:09.480 --> 00:01:11.880
and then it's also going to look at where that

00:01:11.880 --> 00:01:13.000
request is coming from.

00:01:13.010 --> 00:01:15.130
right now we're just kind of building out country

00:01:15.130 --> 00:01:15.400
based

00:01:15.400 --> 00:01:18.150
you could get city level or providence or state

00:01:18.150 --> 00:01:18.470
level.

00:01:18.590 --> 00:01:19.350
but currently

00:01:19.460 --> 00:01:20.850
what we're going to do is we're just going to try

00:01:20.850 --> 00:01:23.330
to check like where is this user like making the

00:01:23.330 --> 00:01:23.850
request.

00:01:23.850 --> 00:01:26.850
And then does that link have any geo routing

00:01:26.850 --> 00:01:27.450
configuration

00:01:27.850 --> 00:01:29.930
that matches that user's location?

00:01:30.090 --> 00:01:30.690
If so,

00:01:30.690 --> 00:01:31.510
it's going to route,

00:01:31.510 --> 00:01:34.210
it's going to figure out where the geo destination

00:01:34.210 --> 00:01:36.490
is and if not it's just going to fall back to that

00:01:36.490 --> 00:01:37.530
default destination.

00:01:37.770 --> 00:01:39.730
So that's the logic that we're going to build.

00:01:39.730 --> 00:01:40.090
And

00:01:41.210 --> 00:01:42.570
this type of implementation,

00:01:42.890 --> 00:01:44.610
if you're like just kind of building this from

00:01:44.610 --> 00:01:45.130
scratch,

00:01:45.210 --> 00:01:46.730
not on top of Cloudflare,

00:01:46.810 --> 00:01:48.970
I do think it is a little bit more cumbersome

00:01:48.970 --> 00:01:51.250
because you typically would have to look at an IP

00:01:51.250 --> 00:01:54.090
address of a user and then have some type of

00:01:54.250 --> 00:01:54.970
database

00:01:55.000 --> 00:01:55.450
stores

00:01:56.040 --> 00:01:58.520
IP address range to a location.

00:01:58.520 --> 00:01:59.230
And those aren't

00:01:59.230 --> 00:02:00.020
crazy accurate,

00:02:00.020 --> 00:02:01.570
but they're good enough and you could

00:02:01.570 --> 00:02:03.480
build an intelligent routing system based on that.

00:02:03.480 --> 00:02:03.800
But

00:02:04.420 --> 00:02:05.490
because Cloudflare is

00:02:05.490 --> 00:02:06.040
a very,

00:02:06.760 --> 00:02:09.640
widely used content delivery network and DNS

00:02:09.640 --> 00:02:10.200
provider,

00:02:10.520 --> 00:02:12.520
their headers actually tag

00:02:12.840 --> 00:02:13.640
all that information

00:02:13.960 --> 00:02:16.440
about the user and about the request that's being

00:02:16.440 --> 00:02:17.400
made for us.

00:02:17.400 --> 00:02:17.550
So,

00:02:17.550 --> 00:02:19.780
we actually don't have to bring in other services,

00:02:20.260 --> 00:02:21.060
which makes it really,

00:02:21.060 --> 00:02:22.210
really powerful if you want to,

00:02:22.210 --> 00:02:23.760
build out server side analytics,

00:02:23.760 --> 00:02:24.650
for your application,

00:02:24.650 --> 00:02:27.250
because they do tag each request with a whole

00:02:27.250 --> 00:02:27.810
bunch of super,

00:02:27.810 --> 00:02:28.770
super useful information.

00:02:29.780 --> 00:02:31.460
so if we head over to our

00:02:31.768 --> 00:02:32.808
project repo,

00:02:32.968 --> 00:02:35.088
we're actually going to be working inside of this

00:02:35.088 --> 00:02:35.848
data service,

00:02:36.448 --> 00:02:37.324
project for now.

00:02:37.355 --> 00:02:39.355
Now if we head over to this data service

00:02:39.595 --> 00:02:40.315
application

00:02:40.795 --> 00:02:42.475
and we go into source,

00:02:42.475 --> 00:02:43.835
you'll see that there's a single file,

00:02:43.835 --> 00:02:45.755
it's going to be the index TS file

00:02:46.155 --> 00:02:48.635
and this is the entry point to the data service.

00:02:48.825 --> 00:02:51.095
if you kind of remember how we configured the

00:02:51.095 --> 00:02:53.095
lightweight backend for our user application,

00:02:53.095 --> 00:02:56.015
you might notice that this setup is slightly

00:02:56.015 --> 00:02:56.295
different.

00:02:56.295 --> 00:02:58.735
It's kind of like a class based setup and I'll

00:02:58.735 --> 00:03:00.195
kind of go compare and contrast.

00:03:00.305 --> 00:03:01.265
worker entry point

00:03:01.585 --> 00:03:03.145
that implements a fetch handler.

00:03:03.145 --> 00:03:05.825
So we're able to route requests and respond to

00:03:05.825 --> 00:03:06.545
requests.

00:03:06.545 --> 00:03:08.265
and for now all it does is it returns.

00:03:08.265 --> 00:03:08.865
Hello world.

00:03:09.425 --> 00:03:13.025
Now our user application had a very similar setup.

00:03:13.025 --> 00:03:15.005
the entry point instead of in the source was in

00:03:15.005 --> 00:03:15.645
the worker

00:03:16.045 --> 00:03:18.845
and we had this index ts and you notice this is

00:03:18.845 --> 00:03:20.125
like a very similar setup,

00:03:20.125 --> 00:03:22.845
but it's not extending a worker entry point,

00:03:22.845 --> 00:03:25.485
it's just exporting a default fetch handler.

00:03:26.245 --> 00:03:28.205
these setups are technically the same.

00:03:28.685 --> 00:03:31.165
There really is no difference between the two

00:03:31.485 --> 00:03:33.845
other than the syntax and the semantics of how

00:03:33.845 --> 00:03:34.915
this is actually built.

00:03:37.265 --> 00:03:38.305
I actually favor

00:03:38.625 --> 00:03:41.185
this route when you're building out like a very

00:03:42.969 --> 00:03:43.769
data service,

00:03:43.849 --> 00:03:46.529
not kind of like compiling a full stack framework

00:03:46.529 --> 00:03:47.929
to deploy on a cloudflare.

00:03:47.929 --> 00:03:49.769
Like if you're just kind of building out services

00:03:49.769 --> 00:03:50.729
that run on workers.

00:03:51.019 --> 00:03:52.579
this is my preferred way of setting it up.

00:03:52.579 --> 00:03:55.139
And the reason why I like setting it up is because

00:03:55.139 --> 00:03:57.529
it's like very clear what you have access to.

00:03:57.529 --> 00:03:59.439
you can see like we're going to be grabbing the

00:03:59.439 --> 00:04:00.479
environment variable.

00:04:01.279 --> 00:04:02.959
You also have access to queues,

00:04:03.119 --> 00:04:04.159
as you can see here.

00:04:04.239 --> 00:04:05.759
You also have access to

00:04:06.319 --> 00:04:08.029
like a cron based scheduler.

00:04:08.069 --> 00:04:10.109
And essentially each one of these methods that

00:04:10.109 --> 00:04:12.469
we're able to implement is considered a worker

00:04:12.469 --> 00:04:13.029
trigger.

00:04:13.059 --> 00:04:14.489
if you look at a fetch handler,

00:04:14.489 --> 00:04:16.769
a fetch handler basically says if we receive a

00:04:16.769 --> 00:04:17.929
HTTP request,

00:04:17.929 --> 00:04:20.529
that is a trigger to invoke a worker and to run

00:04:20.529 --> 00:04:21.329
your worker code.

00:04:21.329 --> 00:04:22.809
Now there's other triggers,

00:04:22.809 --> 00:04:23.449
there's queues,

00:04:23.849 --> 00:04:24.929
there's a schedule.

00:04:24.929 --> 00:04:27.609
So kind of you can configure a cron based job to

00:04:27.609 --> 00:04:28.169
say every

00:04:28.539 --> 00:04:29.649
day at one o',

00:04:29.649 --> 00:04:29.929
clock,

00:04:30.409 --> 00:04:30.889
hit this,

00:04:30.969 --> 00:04:32.379
basically run the worker code,

00:04:32.379 --> 00:04:35.389
and all of the application logic you define inside

00:04:35.389 --> 00:04:36.429
of the handler.

00:04:36.589 --> 00:04:38.789
So inside of the schedule or the queue or the

00:04:38.789 --> 00:04:40.749
fetch is your application code.

00:04:40.839 --> 00:04:41.989
that is kind of trigger based.

00:04:41.989 --> 00:04:44.509
Now the vast majority of the time you're going to

00:04:44.509 --> 00:04:46.189
be building your service is on top of the fetch

00:04:46.189 --> 00:04:46.629
handler,

00:04:46.629 --> 00:04:48.429
but there's a whole bunch of other compute

00:04:48.429 --> 00:04:51.389
primitives that we have access to and this is kind

00:04:51.389 --> 00:04:53.269
of how we interface with them and build on top of

00:04:53.269 --> 00:04:53.509
it.

00:04:53.509 --> 00:04:55.379
So I enjoy building

00:04:55.709 --> 00:04:56.829
and a traditional like service,

00:04:56.829 --> 00:04:59.229
not like your full Stack application where you're

00:04:59.229 --> 00:05:01.029
kind of like building out a UI and your code

00:05:01.029 --> 00:05:01.469
application,

00:05:01.549 --> 00:05:03.029
your crude operations and whatnot.

00:05:03.029 --> 00:05:05.309
When I'm building an actual like data service,

00:05:05.389 --> 00:05:07.469
this is typically the setup that I like to follow.

00:05:07.709 --> 00:05:09.829
And the reason why I prefer the class based

00:05:09.829 --> 00:05:10.189
approach

00:05:12.109 --> 00:05:14.429
over actually just exporting each one of these

00:05:14.429 --> 00:05:16.029
handlers individually is

00:05:16.329 --> 00:05:18.729
because you have access to the constructor and

00:05:18.809 --> 00:05:19.689
you're able to,

00:05:20.039 --> 00:05:20.709
when trigger

00:05:21.219 --> 00:05:22.259
starts up your worker,

00:05:22.579 --> 00:05:23.739
no matter what trigger it is,

00:05:23.739 --> 00:05:24.059
you can,

00:05:24.059 --> 00:05:26.059
under that constructor you can run some

00:05:26.059 --> 00:05:27.739
boilerplate setup code if you have any

00:05:27.739 --> 00:05:29.699
dependencies that you want to set up for your

00:05:29.699 --> 00:05:30.089
request.

00:05:30.089 --> 00:05:32.199
and we're going to get deeper into

00:05:32.519 --> 00:05:34.519
how to kind of play with that constructor to help

00:05:34.519 --> 00:05:34.829
us

00:05:34.829 --> 00:05:36.199
build more scalable applications.

00:05:36.199 --> 00:05:37.789
But it's kind of beyond the point for now.

00:05:40.059 --> 00:05:42.459
we're just going to run the application so we can

00:05:42.459 --> 00:05:44.619
say pnpm or just make sure that you have

00:05:45.129 --> 00:05:46.569
CD into data service.

00:05:46.729 --> 00:05:48.569
So CD into apps,

00:05:48.729 --> 00:05:49.449
data service.

00:05:49.449 --> 00:05:51.049
Now we're in the data service application,

00:05:51.049 --> 00:05:52.489
then you can say pnpm run

00:05:53.289 --> 00:05:55.289
dev and that's going to spin up our application.

00:05:55.529 --> 00:05:57.769
This is going to be running on port 8787.

00:05:57.769 --> 00:05:59.289
This is the default port that

00:05:59.409 --> 00:06:01.269
Cloudflare applications run on.

00:06:01.269 --> 00:06:04.589
Unless you bring in a framework that specifies a

00:06:04.589 --> 00:06:05.269
different port

00:06:05.909 --> 00:06:07.709
and if we head over here,

00:06:07.709 --> 00:06:09.589
you can see if we load this page,

00:06:09.589 --> 00:06:10.429
we get hello,

00:06:10.429 --> 00:06:11.389
world rendered.

00:06:11.389 --> 00:06:13.109
So this is just a very simple hello,

00:06:13.109 --> 00:06:15.109
world fetch handler that returns some

00:06:15.409 --> 00:06:16.769
response text to us.

00:06:16.955 --> 00:06:17.115
Now,

00:06:17.115 --> 00:06:18.755
before we move deeper into building out these

00:06:18.755 --> 00:06:19.035
services,

00:06:19.115 --> 00:06:21.395
let's go ahead and deploy just so we can make sure

00:06:21.395 --> 00:06:23.635
our application starts in a perfect state and

00:06:23.635 --> 00:06:24.795
everything's running as expected.

00:06:24.985 --> 00:06:26.495
in our package JSON file,

00:06:26.495 --> 00:06:29.015
we have a deploy script which is just running

00:06:29.015 --> 00:06:29.975
Wrangler Deploy.

00:06:30.025 --> 00:06:32.675
having a basic worker entry point like this

00:06:33.155 --> 00:06:35.035
really requires very little overhead and

00:06:35.035 --> 00:06:35.715
configuration.

00:06:35.715 --> 00:06:36.595
As you can see

00:06:36.705 --> 00:06:38.775
Wrangler JSON file is very,

00:06:38.775 --> 00:06:39.615
very minimal.

00:06:39.655 --> 00:06:40.335
and our

00:06:41.055 --> 00:06:43.095
startup scripts are also very basic.

00:06:43.095 --> 00:06:45.095
So this is meant to be there.

00:06:45.095 --> 00:06:46.935
So basically we have deploy and we have dev.

00:06:46.935 --> 00:06:48.655
These are the two things that we care most about

00:06:48.655 --> 00:06:49.135
right now.

00:06:49.375 --> 00:06:51.775
So we're going to say pnpm run deploy.

00:06:52.311 --> 00:06:54.111
This is asking me to authenticate,

00:06:54.111 --> 00:06:56.071
because I haven't authenticated in a little bit.

00:06:56.151 --> 00:06:59.111
Probably will not ask for you to do that because

00:06:59.111 --> 00:07:00.791
you probably just barely did this.

00:07:01.421 --> 00:07:04.531
now we have this application deployed so we can

00:07:04.531 --> 00:07:05.531
grab this URL,

00:07:05.771 --> 00:07:07.131
head over to a browser,

00:07:07.771 --> 00:07:10.331
and we should see the hello world as well.

00:07:10.441 --> 00:07:12.481
that's really all that we have to do right now to

00:07:12.481 --> 00:07:13.321
get this thing set up.

00:07:13.321 --> 00:07:14.231
And then now I'm going to show you

00:07:14.231 --> 00:07:16.648
how we can start building out these services in a

00:07:16.648 --> 00:07:17.608
really modular way.

00:07:17.608 --> 00:07:18.338
How we can test them,

00:07:18.338 --> 00:07:18.388
them,

00:07:18.388 --> 00:07:19.748
make sure everything's working as expected.

