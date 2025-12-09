WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.000 --> 00:00:01.590
so deploying to Cloudflare is actually pretty

00:00:01.590 --> 00:00:02.190
straightforward.

00:00:02.190 --> 00:00:03.990
All you have to do is create a free Cloudflare

00:00:03.990 --> 00:00:05.470
account and you'll be taken to this page.

00:00:05.790 --> 00:00:07.270
Now there's a ton of different features that

00:00:07.270 --> 00:00:09.150
Cloudflare has to offer as they've been around for

00:00:09.150 --> 00:00:09.350
many,

00:00:09.350 --> 00:00:11.710
many years and they've really been known for their

00:00:11.710 --> 00:00:12.350
DNS,

00:00:12.510 --> 00:00:14.230
CDN and security features.

00:00:14.230 --> 00:00:16.510
But within the last five years their worker

00:00:16.510 --> 00:00:18.870
platform for COMPUTE has actually really been

00:00:18.870 --> 00:00:20.950
taken off and that's what we're going to be

00:00:20.950 --> 00:00:23.190
spending most of our time in is this section down

00:00:23.190 --> 00:00:23.430
here.

00:00:23.430 --> 00:00:25.430
So if you scroll down here you'll see we have

00:00:25.430 --> 00:00:26.500
COMPUTE work workers

00:00:26.581 --> 00:00:28.002
and under here we have a whole bunch of different

00:00:28.242 --> 00:00:28.642
products.

00:00:29.652 --> 00:00:31.332
the main thing that we're going to focus on right

00:00:31.332 --> 00:00:32.772
now is workers and pages.

00:00:33.092 --> 00:00:34.852
Now there's a lot of different ways to deploy and

00:00:34.852 --> 00:00:36.332
we're going to be going through many of them in

00:00:36.332 --> 00:00:36.772
this course.

00:00:36.772 --> 00:00:38.652
But to get started we're going to be using the

00:00:38.652 --> 00:00:39.131
CLI.

00:00:39.278 --> 00:00:41.878
So let's head back to our repo and let's navigate

00:00:41.878 --> 00:00:43.118
over to the apps

00:00:43.518 --> 00:00:44.558
user application.

00:00:44.558 --> 00:00:46.638
This is the UI application that we just barely

00:00:46.638 --> 00:00:47.038
ran.

00:00:47.198 --> 00:00:49.078
And let's head over to the very bottom where we

00:00:49.078 --> 00:00:50.718
see Wrangler JSON C.

00:00:51.118 --> 00:00:51.398
Now,

00:00:51.398 --> 00:00:54.118
this file is the configuration that instructs

00:00:54.118 --> 00:00:56.718
Cloudflare on how to deploy our code.

00:00:56.958 --> 00:00:57.638
It tells our,

00:00:57.638 --> 00:00:59.798
it tells Cloudflare exactly where the entry point

00:00:59.798 --> 00:01:00.878
for our application is.

00:01:01.448 --> 00:01:03.848
It gives our application a name that Cloudflare

00:01:03.848 --> 00:01:06.168
will use internally to basically keep track of the

00:01:06.168 --> 00:01:07.448
uniqueness of the application.

00:01:07.768 --> 00:01:09.088
And then we have a whole bunch of other

00:01:09.088 --> 00:01:09.848
configurations.

00:01:10.258 --> 00:01:12.538
this is a very small Wrangler file,

00:01:12.538 --> 00:01:12.818
but,

00:01:12.978 --> 00:01:13.418
you know,

00:01:13.418 --> 00:01:15.298
as we build out more and more features and we're

00:01:15.298 --> 00:01:16.418
using more and more resources,

00:01:16.498 --> 00:01:18.138
we're going to see that this file actually gets

00:01:18.138 --> 00:01:18.658
very large.

00:01:18.818 --> 00:01:19.218
So,

00:01:19.758 --> 00:01:22.038
there's really a lot of complexity around the

00:01:22.038 --> 00:01:23.518
Wrangler JSON C file.

00:01:23.518 --> 00:01:25.278
There's so many different features that Cloudflare

00:01:25.278 --> 00:01:25.718
has to offer,

00:01:25.718 --> 00:01:27.838
and they're all dictated by what we specify in

00:01:27.838 --> 00:01:28.358
this file.

00:01:28.358 --> 00:01:29.638
So throughout this course,

00:01:29.638 --> 00:01:30.708
we're going to go figure out

00:01:31.098 --> 00:01:33.178
deep into the different offerings and how to use

00:01:33.178 --> 00:01:35.058
the Wrangler JSON C file.

00:01:35.058 --> 00:01:36.618
And hopefully by the end of the course you'll be

00:01:36.618 --> 00:01:38.378
able to go through the documentation when you're

00:01:38.378 --> 00:01:40.258
building out new things or using new Cloudflare

00:01:40.258 --> 00:01:40.498
products,

00:01:40.498 --> 00:01:43.218
and you'll be able to seamlessly learn and be able

00:01:43.218 --> 00:01:43.658
to use,

00:01:43.658 --> 00:01:45.458
different features without really having to like,

00:01:45.458 --> 00:01:47.498
dive too deep into the documentation and try too

00:01:47.498 --> 00:01:47.778
hard.

00:01:47.858 --> 00:01:49.218
So just note,

00:01:49.298 --> 00:01:51.338
for the purposes of this deployment,

00:01:51.338 --> 00:01:53.338
for our very first deployment is this file

00:01:53.338 --> 00:01:54.818
instructs Cloudflare on

00:01:55.298 --> 00:01:56.338
what our code is,

00:01:56.338 --> 00:01:57.378
how to use it and,

00:01:57.448 --> 00:01:58.408
and then how to deploy it.

00:01:58.888 --> 00:01:59.128
Now,

00:01:59.128 --> 00:02:01.328
if we head over to our package JSON file,

00:02:01.328 --> 00:02:03.048
what we're going to notice is we have a,

00:02:03.678 --> 00:02:06.608
we have a deploy script that's running NPM run

00:02:06.608 --> 00:02:06.888
build,

00:02:06.888 --> 00:02:07.768
it's building our project,

00:02:07.848 --> 00:02:09.528
it's compiling it and

00:02:09.758 --> 00:02:11.968
bundling it in a way that is understandable by a

00:02:11.968 --> 00:02:12.848
Cloudflare worker.

00:02:13.168 --> 00:02:15.568
And then it is running Wrangler Deploy,

00:02:15.678 --> 00:02:16.468
this Wrangler

00:02:17.108 --> 00:02:17.828
dependency

00:02:18.388 --> 00:02:20.388
as what we will be able to see it at the very

00:02:20.388 --> 00:02:21.268
bottom of our

00:02:21.938 --> 00:02:22.769
dev dependencies.

00:02:22.769 --> 00:02:24.868
This is Cloudflare CLI tool that manages

00:02:24.868 --> 00:02:27.028
Cloudflare resources and deployments.

00:02:27.668 --> 00:02:28.548
This is the,

00:02:28.548 --> 00:02:29.748
this is honestly a very,

00:02:29.748 --> 00:02:30.228
very important

00:02:30.498 --> 00:02:33.138
CLI tool when you're working in Cloudflare and as

00:02:33.138 --> 00:02:35.178
you're using more and more different features,

00:02:35.178 --> 00:02:36.418
you'll learn what you can do.

00:02:36.418 --> 00:02:36.738
But

00:02:37.378 --> 00:02:39.418
90% of the time the only thing that you use

00:02:39.418 --> 00:02:40.978
Wrangler for is for

00:02:41.179 --> 00:02:42.539
just deploying your application.

00:02:42.699 --> 00:02:44.379
So what we're going to do is we're going to make

00:02:44.379 --> 00:02:47.019
sure we're in our User Application folder.

00:02:47.019 --> 00:02:48.299
So we'll head over to Apps

00:02:48.859 --> 00:02:49.880
User Application

00:02:50.900 --> 00:02:52.980
and then we're going to run pnpm,

00:02:53.220 --> 00:02:53.620
run

00:02:54.020 --> 00:02:54.660
deploy,

00:02:54.740 --> 00:02:56.684
which is this command right here.

00:02:56.922 --> 00:02:58.812
And we're going to notice that our application is

00:02:58.812 --> 00:02:59.132
building,

00:02:59.212 --> 00:03:01.652
it's creating a bundle of our entire front end

00:03:01.652 --> 00:03:02.252
application.

00:03:02.834 --> 00:03:04.274
And then what it's done is

00:03:04.594 --> 00:03:05.634
for your first time,

00:03:05.794 --> 00:03:06.694
what happens is it

00:03:06.694 --> 00:03:08.430
opens up a Chrome browser.

00:03:08.430 --> 00:03:09.690
Let me pull this on over right here.

00:03:09.690 --> 00:03:12.025
It opens up a browser that basically asks for your

00:03:12.025 --> 00:03:12.466
permission.

00:03:12.626 --> 00:03:13.202
So this

00:03:13.202 --> 00:03:13.292
browser.

00:03:13.292 --> 00:03:14.572
You're going to go ahead and you're going to say

00:03:14.572 --> 00:03:14.892
allow.

00:03:15.132 --> 00:03:16.252
This gives,

00:03:16.262 --> 00:03:18.322
the Wrangler CLI access to your cloudflare

00:03:18.322 --> 00:03:18.602
account.

00:03:19.102 --> 00:03:20.222
Now if we head back over here,

00:03:20.222 --> 00:03:21.742
we're going to see it's going to complete the

00:03:21.742 --> 00:03:23.982
build and right now it's taking all of these files

00:03:23.982 --> 00:03:26.142
that got bundled and it's uploading it to

00:03:26.142 --> 00:03:27.102
cloudflare servers.

00:03:27.102 --> 00:03:28.622
It's uploading the static files,

00:03:28.622 --> 00:03:29.382
the JS files,

00:03:29.382 --> 00:03:30.102
the HTML,

00:03:30.102 --> 00:03:30.742
the styles,

00:03:30.742 --> 00:03:31.582
it's uploading that

00:03:32.702 --> 00:03:35.342
to their cdn to servers all around the world so it

00:03:35.342 --> 00:03:37.182
can be served really quickly to users.

00:03:37.262 --> 00:03:39.422
And it's also uploading that server side code.

00:03:39.952 --> 00:03:42.266
so the worker runtime will be able to handle our

00:03:42.266 --> 00:03:44.146
HTTP requests in our application.

00:03:44.926 --> 00:03:47.206
So what you're going to notice here is it gave us

00:03:47.206 --> 00:03:48.046
this URL.

00:03:48.856 --> 00:03:52.496
this URL is basically you have like a email or a

00:03:52.496 --> 00:03:54.536
name that you signed up with cloudflare Workers

00:03:54.616 --> 00:03:54.936
Dev.

00:03:54.936 --> 00:03:56.456
And then you can see User Application,

00:03:56.456 --> 00:03:57.466
which is the name of our

00:03:57.466 --> 00:03:57.816
service.

00:03:58.056 --> 00:03:59.976
So we're going to go ahead and we're going to open

00:03:59.976 --> 00:04:00.376
this guy,

00:04:00.376 --> 00:04:02.096
I'm going to copy this and head back over to that

00:04:02.096 --> 00:04:02.936
browser window

00:04:03.388 --> 00:04:05.816
and you can see that we are actually able to view

00:04:05.816 --> 00:04:07.776
our deployed version of our website.

00:04:08.376 --> 00:04:10.576
we can head on over to the dashboard,

00:04:10.576 --> 00:04:12.336
you can see it's interactive and everything's

00:04:12.336 --> 00:04:13.176
working as expected.

00:04:13.336 --> 00:04:15.136
So deployment really is that simple.

00:04:15.136 --> 00:04:16.216
I know I explained a lot,

00:04:16.216 --> 00:04:18.416
but the takeaway is you can run npm,

00:04:18.416 --> 00:04:19.056
run Deploy,

00:04:19.056 --> 00:04:21.376
that's calling the Wrangler Deploy command and

00:04:21.376 --> 00:04:23.456
it's uploading all of your static assets and your

00:04:23.456 --> 00:04:25.456
server side code up to Cloudflare servers,

00:04:25.456 --> 00:04:28.376
so it's able to be used by the worker runtime.

00:04:28.726 --> 00:04:30.796
one other thing to note is if we head back over

00:04:30.796 --> 00:04:33.316
Here to our workers and pages in the Cloudflare

00:04:33.316 --> 00:04:33.916
Dashboard,

00:04:33.996 --> 00:04:35.916
you'll be able to see the entry of this

00:04:35.916 --> 00:04:38.076
application and you can click on it and there's a

00:04:38.076 --> 00:04:38.876
whole bunch of stuff here.

00:04:39.576 --> 00:04:41.176
See deployments when they occurred.

00:04:41.496 --> 00:04:43.296
you can look at metrics about usage.

00:04:43.296 --> 00:04:44.936
So whenever you get requests,

00:04:44.936 --> 00:04:46.416
you can see the analytics here,

00:04:46.416 --> 00:04:47.416
sub requests.

00:04:47.416 --> 00:04:49.136
you'll be able to see error traces.

00:04:49.906 --> 00:04:52.346
since we have enabled inside of our Wrangler

00:04:52.346 --> 00:04:52.866
config,

00:04:53.845 --> 00:04:55.965
since we have observability enabled,

00:04:55.965 --> 00:04:58.245
we'll be able to see logs come in.

00:04:58.245 --> 00:04:59.486
whenever we get requests,

00:04:59.710 --> 00:05:01.070
we'll be able to see bindings.

00:05:01.150 --> 00:05:02.230
we'll touch on this later.

00:05:02.710 --> 00:05:05.350
But essentially we have an asset binding which is

00:05:05.350 --> 00:05:05.670
the,

00:05:05.810 --> 00:05:06.790
static files,

00:05:06.790 --> 00:05:07.710
the JavaScript files,

00:05:07.710 --> 00:05:09.110
the HTML files for,

00:05:09.190 --> 00:05:10.676
from the bundle of our application.

00:05:10.676 --> 00:05:11.978
And then we have settings.

00:05:11.978 --> 00:05:14.298
And we're going to go very deep into a lot of

00:05:14.298 --> 00:05:15.658
these different things throughout the course.

00:05:15.658 --> 00:05:17.618
But just know that this is the interface that we

00:05:17.618 --> 00:05:17.978
can be,

00:05:17.978 --> 00:05:19.058
that we can interface with,

00:05:19.058 --> 00:05:22.158
if you enjoy using or if you want to use a UI

00:05:22.158 --> 00:05:23.078
provided by Cloudflare.

00:05:23.078 --> 00:05:24.798
Now all of this stuff can also be managed through

00:05:24.798 --> 00:05:25.758
the Wrangler cli,

00:05:25.758 --> 00:05:26.638
which we just looked at.

00:05:26.638 --> 00:05:26.998
But,

00:05:27.858 --> 00:05:29.538
very often you just kind of come over to the

00:05:29.538 --> 00:05:29.898
Dashboard,

00:05:29.898 --> 00:05:31.658
find your application and you can manage stuff

00:05:31.658 --> 00:05:31.848
here.

00:05:31.988 --> 00:05:32.948
another thing to note,

00:05:32.948 --> 00:05:33.828
domains and routes.

00:05:33.908 --> 00:05:36.108
So we'll be able to hook up our own domain,

00:05:36.108 --> 00:05:37.628
which we'll be doing towards the end of the

00:05:37.628 --> 00:05:37.908
course,

00:05:38.108 --> 00:05:38.668
as well.

00:05:38.668 --> 00:05:40.228
So this is the deployment process.

00:05:40.228 --> 00:05:41.148
You're going to become very,

00:05:41.148 --> 00:05:42.908
very familiar with this throughout the entire

00:05:42.908 --> 00:05:43.227
course.

00:05:43.227 --> 00:05:44.988
But at this point you should have

00:05:45.468 --> 00:05:47.228
a deployed version of your application

00:05:47.628 --> 00:05:49.548
ready to go and usable.

