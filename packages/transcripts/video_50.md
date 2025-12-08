WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.098 --> 00:00:00.498
All right,

00:00:00.498 --> 00:00:02.178
so now let's talk about domains.

00:00:02.338 --> 00:00:02.618
So,

00:00:02.618 --> 00:00:02.858
I mean,

00:00:02.858 --> 00:00:04.818
this is kind of really what Cloudflare is known

00:00:04.818 --> 00:00:05.138
for.

00:00:05.138 --> 00:00:06.138
They have a very,

00:00:06.138 --> 00:00:07.298
very great DNS,

00:00:07.548 --> 00:00:08.188
cdn.

00:00:08.188 --> 00:00:09.788
You can manage your domains through them.

00:00:10.268 --> 00:00:10.508
Now,

00:00:10.508 --> 00:00:13.508
I do think most people that utilize Cloudflare,

00:00:13.508 --> 00:00:14.108
they actually

00:00:14.588 --> 00:00:17.308
go through this domain process where they transfer

00:00:17.308 --> 00:00:18.828
their domains to Cloudflare.

00:00:19.358 --> 00:00:22.678
so a lot of people will buy domains@namecheap.com

00:00:22.678 --> 00:00:24.718
or GoDaddy or really wherever,

00:00:24.718 --> 00:00:25.678
and that's really fine.

00:00:25.678 --> 00:00:26.278
You can do that.

00:00:26.278 --> 00:00:27.598
You just literally sear

00:00:28.378 --> 00:00:29.378
namecheapcloudflare.

00:00:29.378 --> 00:00:31.458
And there will be tons of videos to show you how

00:00:31.458 --> 00:00:31.738
to,

00:00:32.588 --> 00:00:34.908
to move your domain name to basically allow,

00:00:35.138 --> 00:00:36.748
Cloudflare's DNS to manage it.

00:00:37.388 --> 00:00:37.708
Now,

00:00:37.708 --> 00:00:39.668
what we're gonna do for the purpose of this course

00:00:39.668 --> 00:00:41.348
is we're just gonna literally buy our domain

00:00:41.348 --> 00:00:42.028
through Cloudflare,

00:00:42.028 --> 00:00:43.347
so under domain registrations,

00:00:43.347 --> 00:00:45.468
we can go to register domains.

00:00:45.628 --> 00:00:48.588
And I have a little stupid domain name that I

00:00:48.588 --> 00:00:49.548
think should be available.

00:00:49.642 --> 00:00:52.102
smart link with no vals and no n,

00:00:52.102 --> 00:00:53.382
because the one with the N is taken.

00:00:53.522 --> 00:00:54.702
this is available for $10.

00:00:54.702 --> 00:00:56.262
I'm probably just gonna stash this domain name

00:00:56.262 --> 00:00:57.022
after because I really

00:00:57.322 --> 00:00:57.722
care about it.

00:00:57.722 --> 00:00:59.842
But I just want to show you all the process of

00:00:59.842 --> 00:01:01.682
actually onboarding a domain and using it.

00:01:01.682 --> 00:01:03.562
So we're going to go ahead and purchase that

00:01:03.962 --> 00:01:04.362
and,

00:01:04.742 --> 00:01:05.942
fill out this information.

00:01:06.182 --> 00:01:07.822
I'm going to pause the video,

00:01:07.822 --> 00:01:09.702
and then we'll come back after the purchase is

00:01:09.702 --> 00:01:10.176
successful.

00:01:10.202 --> 00:01:10.762
All right,

00:01:10.762 --> 00:01:12.602
so once the purchase is done,

00:01:12.922 --> 00:01:14.682
it'll give you some information about,

00:01:15.302 --> 00:01:16.342
about the domain,

00:01:17.222 --> 00:01:18.582
who the register is,

00:01:18.742 --> 00:01:19.382
and then

00:01:20.692 --> 00:01:22.612
now what we're going to do is we can.

00:01:22.612 --> 00:01:23.972
If you just go to account home

00:01:23.983 --> 00:01:25.947
when you buy a domain or you have a domain that

00:01:25.947 --> 00:01:26.787
you are you,

00:01:27.027 --> 00:01:28.867
that you have onboarded onto Cloudflare,

00:01:28.867 --> 00:01:31.347
you'll be able to see that it is available here.

00:01:31.417 --> 00:01:34.167
so from there we can actually directly configure

00:01:34.167 --> 00:01:35.447
this inside of our worker,

00:01:35.447 --> 00:01:36.367
and we can,

00:01:36.837 --> 00:01:39.437
have our worker code point at this domain instead

00:01:39.437 --> 00:01:40.437
of our actual,

00:01:40.437 --> 00:01:40.757
like,

00:01:40.757 --> 00:01:42.517
instead of that randomly generated

00:01:42.837 --> 00:01:43.547
domain that,

00:01:43.547 --> 00:01:44.517
Cloudflare gave us.

00:01:44.517 --> 00:01:45.528
So let's go ahead and do that.

00:01:45.648 --> 00:01:45.768
Now,

00:01:45.768 --> 00:01:47.648
before we configure this domain,

00:01:47.888 --> 00:01:49.488
inside of our worker,

00:01:49.488 --> 00:01:51.688
a few things that I do want to call out that are

00:01:51.688 --> 00:01:52.448
nice is,

00:01:52.928 --> 00:01:55.008
there's so much that you can do in terms of like

00:01:55.008 --> 00:01:57.168
networking and networking configurations.

00:01:58.288 --> 00:01:59.008
I would say,

00:01:59.008 --> 00:02:00.448
at least if you're going to do,

00:02:01.408 --> 00:02:03.608
I would say for sure what you should do is you

00:02:03.608 --> 00:02:05.368
should come over to these cloudflare rules and

00:02:05.368 --> 00:02:05.648
then,

00:02:06.048 --> 00:02:08.328
I mean I think almost every single use case

00:02:08.328 --> 00:02:10.128
you're going to want to do automatic redirects

00:02:10.128 --> 00:02:11.728
from HTTP to HTTPs.

00:02:11.808 --> 00:02:12.608
So you can come in,

00:02:12.608 --> 00:02:13.648
you can go ahead and create that

00:02:13.948 --> 00:02:16.348
and we can basically say we're going to apply it

00:02:16.348 --> 00:02:18.348
for all incoming requests,

00:02:19.708 --> 00:02:21.388
and we can go ahead and deploy that.

00:02:21.628 --> 00:02:24.148
So basically this is going to not be at the worker

00:02:24.148 --> 00:02:26.468
level but be at the network level before the code

00:02:26.468 --> 00:02:27.388
reaches our worker.

00:02:27.388 --> 00:02:28.588
Everything's going to be,

00:02:29.088 --> 00:02:32.708
redirected to HTTPs just to keep that clean for

00:02:32.708 --> 00:02:32.912
us.

00:02:32.958 --> 00:02:35.718
Configuring a domain in your worker is actually

00:02:35.718 --> 00:02:37.718
pretty straightforward once you've bought your

00:02:37.718 --> 00:02:40.158
domain and have it onboarded onto cloudflare.

00:02:40.318 --> 00:02:40.718
So

00:02:41.028 --> 00:02:42.338
there's kind of two concepts here.

00:02:42.338 --> 00:02:44.338
There's custom domains and there's routes.

00:02:44.898 --> 00:02:47.178
Custom domains are basically just like an entire

00:02:47.178 --> 00:02:47.618
domain,

00:02:47.618 --> 00:02:50.058
whether it be a subdomain or just like the normal

00:02:50.058 --> 00:02:51.298
domain with no subdomain.

00:02:51.628 --> 00:02:54.978
and it applies to all the paths on a given domain.

00:02:54.978 --> 00:02:56.978
So you can just think about it if it's just like

00:02:57.358 --> 00:02:58.158
I want to have

00:02:58.478 --> 00:03:01.078
everything from example.com to route to a worker

00:03:01.078 --> 00:03:03.438
or shop dot example.com to route to a specific

00:03:03.438 --> 00:03:03.918
worker.

00:03:03.918 --> 00:03:04.318
Now

00:03:04.838 --> 00:03:06.638
and this is what the configuration would look like

00:03:06.638 --> 00:03:07.078
as well.

00:03:07.528 --> 00:03:09.648
the other option is routes and I'm going to show

00:03:09.648 --> 00:03:10.928
you kind of how to configure both.

00:03:10.928 --> 00:03:12.447
We're going to start with custom domains,

00:03:12.447 --> 00:03:14.408
but routes are a little bit more

00:03:14.728 --> 00:03:16.348
you have to be a little bit more methodical about

00:03:16.348 --> 00:03:18.388
it because you're ultimately allowing this

00:03:18.388 --> 00:03:19.668
wildcard character to say

00:03:20.068 --> 00:03:22.508
everything at a certain path is going to be routed

00:03:22.508 --> 00:03:23.108
to some

00:03:23.388 --> 00:03:24.658
to a specific worker.

00:03:24.658 --> 00:03:27.178
So you could say like everything at.

00:03:27.638 --> 00:03:28.038
In this

00:03:28.358 --> 00:03:30.598
diagram they say like everything at auth

00:03:30.998 --> 00:03:33.118
is going to go to a specific server or everything

00:03:33.118 --> 00:03:34.518
at forward slash API.

00:03:34.518 --> 00:03:37.318
Or you could even do wildcards on like a given

00:03:37.318 --> 00:03:38.518
subdomain as well.

00:03:38.898 --> 00:03:41.138
it's like you could basically say in this example

00:03:41.458 --> 00:03:44.258
everything@starexample.com is going to

00:03:44.718 --> 00:03:46.758
route to like a specific worker.

00:03:46.826 --> 00:03:50.586
So let's start by configuring a custom domain in

00:03:50.586 --> 00:03:51.306
our application.

00:03:51.386 --> 00:03:53.186
So what I'm going to do is I'm going to go over to

00:03:53.186 --> 00:03:54.356
user application and,

00:03:54.506 --> 00:03:56.306
and I'm going to first actually go to the

00:03:56.306 --> 00:03:58.506
production side of things and I actually have this

00:03:58.506 --> 00:03:59.126
coded out.

00:03:59.126 --> 00:04:00.726
But what we can do is we can also

00:04:01.906 --> 00:04:02.746
start from scratch.

00:04:02.826 --> 00:04:04.586
So you like above.

00:04:04.586 --> 00:04:04.986
I would.

00:04:04.986 --> 00:04:07.186
I usually like to do it at the top level of a

00:04:07.186 --> 00:04:07.466
given

00:04:08.136 --> 00:04:08.536
environment.

00:04:09.256 --> 00:04:11.656
You can basically say routes and then inside of

00:04:11.656 --> 00:04:13.496
routes is going to take an object of either

00:04:13.816 --> 00:04:15.896
custom domain configurations or

00:04:16.836 --> 00:04:17.996
route configuration.

00:04:17.996 --> 00:04:19.396
So we'll start with custom domain.

00:04:19.396 --> 00:04:22.196
So we can basically say custom domain is true

00:04:23.156 --> 00:04:23.396
and

00:04:24.036 --> 00:04:24.436
the,

00:04:26.062 --> 00:04:27.662
the pattern is going to be

00:04:27.982 --> 00:04:29.582
our specific domain.

00:04:29.662 --> 00:04:33.102
So smrtlk.com

00:04:34.382 --> 00:04:35.422
now from here

00:04:35.822 --> 00:04:38.142
literally all you have to do is if you go into

00:04:38.142 --> 00:04:38.462
your

00:04:38.862 --> 00:04:38.952
user

00:04:39.202 --> 00:04:40.162
application directory,

00:04:40.162 --> 00:04:41.722
the next time you deploy pnpm,

00:04:41.722 --> 00:04:42.002
run

00:04:42.322 --> 00:04:43.922
Production deploy,

00:04:45.738 --> 00:04:47.498
what you're going to notice at the end is it's

00:04:47.498 --> 00:04:49.098
going to give you a specific

00:04:50.328 --> 00:04:52.248
URL to use to view your

00:04:52.428 --> 00:04:53.948
worker that Isn't the.

00:04:54.988 --> 00:04:56.871
That isn't the Cloudflare provided one.

00:04:56.871 --> 00:05:00.662
So you can notice now the domain is Smartlink and

00:05:00.662 --> 00:05:03.782
this will likely take a little bit of time

00:05:04.182 --> 00:05:06.102
once you deploy for the first time.

00:05:07.362 --> 00:05:09.602
it doesn't for me because I previously deployed,

00:05:09.602 --> 00:05:12.202
but it might take 10 minutes for yours to actually

00:05:12.202 --> 00:05:14.002
show up and be working as expected.

00:05:14.352 --> 00:05:15.202
which is totally okay.

00:05:15.202 --> 00:05:16.842
Just sometimes takes a little bit of time for the

00:05:16.842 --> 00:05:17.882
DNS to propagate.

00:05:17.882 --> 00:05:20.042
But what you can see is like we're able to go to

00:05:20.042 --> 00:05:22.242
our custom domain now and we can

00:05:22.882 --> 00:05:24.962
go to app and we can see everything inside of the

00:05:24.962 --> 00:05:25.282
app.

00:05:25.442 --> 00:05:25.842
So

00:05:26.112 --> 00:05:26.672
this is,

00:05:26.832 --> 00:05:27.592
this is essentially,

00:05:27.592 --> 00:05:29.552
basically saying everything at this home page is

00:05:29.552 --> 00:05:30.592
going to be routed here.

00:05:30.672 --> 00:05:33.252
Now we can also do is we can come into

00:05:33.562 --> 00:05:33.992
stage

00:05:34.472 --> 00:05:35.992
and I'm going to do a similar thing.

00:05:36.392 --> 00:05:37.192
I'm going to go

00:05:37.592 --> 00:05:38.072
routes

00:05:39.512 --> 00:05:42.232
and then inside of routes I'm going to say custom

00:05:42.232 --> 00:05:43.512
domain is also true

00:05:43.606 --> 00:05:44.001
but

00:05:44.481 --> 00:05:46.481
the pattern is actually going to be

00:05:46.881 --> 00:05:50.401
stage.smartlink.com

00:05:51.681 --> 00:05:53.841
and then I'm going to PNPM run

00:05:54.506 --> 00:05:55.146
stage

00:05:56.556 --> 00:05:57.036
deploy.

00:05:59.714 --> 00:06:01.074
Now when this is done,

00:06:01.764 --> 00:06:03.364
we should be able to access

00:06:03.872 --> 00:06:06.680
our service at Stage Smartlink.

00:06:07.560 --> 00:06:10.250
Now this error actually to me indicates that

00:06:10.570 --> 00:06:11.770
this deployment didn't work.

00:06:11.850 --> 00:06:14.850
And what we're going to notice here is the link

00:06:14.850 --> 00:06:17.050
that it gave us at the end of our deploy actually

00:06:17.050 --> 00:06:19.290
is pointing@smartlink.com so

00:06:19.610 --> 00:06:22.650
one thing that I'm noticing here in our specific

00:06:22.730 --> 00:06:24.250
build script for Stage,

00:06:24.890 --> 00:06:26.970
essentially what we're going to want to do is

00:06:26.970 --> 00:06:29.170
we're going to want to also pass in a flag the

00:06:29.170 --> 00:06:31.130
same way we're doing for this production build.

00:06:31.210 --> 00:06:33.530
So inside of our normal build

00:06:34.010 --> 00:06:35.930
I'm just basically going to say

00:06:37.608 --> 00:06:38.968
build is going to run

00:06:40.808 --> 00:06:41.334
mode,

00:06:42.534 --> 00:06:42.934
development.

00:06:45.894 --> 00:06:47.854
We'll deploy that one more time and see if it goes

00:06:47.854 --> 00:06:48.110
through.

00:06:48.110 --> 00:06:48.572
All right?

00:06:48.572 --> 00:06:49.052
Yeah,

00:06:49.052 --> 00:06:50.852
so just make sure that you have these

00:06:50.852 --> 00:06:51.932
configured properly.

00:06:51.932 --> 00:06:54.012
The configuration is kind of always a tedious

00:06:54.012 --> 00:06:54.292
thing.

00:06:54.292 --> 00:06:54.612
But

00:06:55.672 --> 00:06:58.632
so now you can see the output of this says stage

00:06:58.632 --> 00:06:59.752
smartlink.com

00:07:00.055 --> 00:07:01.415
we can head on over to that

00:07:03.259 --> 00:07:05.099
and it is working as expected.

00:07:05.419 --> 00:07:07.299
Now one thing you're going to notice both on our

00:07:07.299 --> 00:07:08.299
production deploy

00:07:09.099 --> 00:07:09.978
and our

00:07:11.259 --> 00:07:11.319
stage

00:07:11.599 --> 00:07:14.759
deploy is this disconnected is actually showing as

00:07:14.759 --> 00:07:15.439
disconnected.

00:07:15.639 --> 00:07:17.559
websocket's not actually connecting to our server.

00:07:17.559 --> 00:07:18.319
And that is because

00:07:18.799 --> 00:07:19.199
the

00:07:19.869 --> 00:07:21.909
previously configured domain that we kind of have

00:07:21.909 --> 00:07:23.629
hard coded in our code base is

00:07:24.330 --> 00:07:24.689
is.

00:07:24.769 --> 00:07:26.769
We can take a look at our.

00:07:26.769 --> 00:07:28.129
We head over to our workers,

00:07:30.041 --> 00:07:31.536
we can go to user application

00:07:31.570 --> 00:07:34.970
and what we can notice is this previous domain now

00:07:34.970 --> 00:07:35.650
is inactive.

00:07:35.650 --> 00:07:37.130
We're actually not able to use it.

00:07:37.130 --> 00:07:37.550
and we're,

00:07:37.550 --> 00:07:39.270
and we're actually using this custom

00:07:39.810 --> 00:07:40.210
domain.

00:07:40.210 --> 00:07:42.290
So in our build as well,

00:07:42.530 --> 00:07:45.090
we're going to want to update our variables here.

00:07:45.590 --> 00:07:47.130
so we're going to want to basically come in and

00:07:47.130 --> 00:07:48.010
we're going to want to say

00:07:48.490 --> 00:07:48.890
our

00:07:49.450 --> 00:07:52.450
base host is no longer that one that's provided by

00:07:52.450 --> 00:07:53.130
Cloudflare

00:07:53.610 --> 00:07:55.330
and is staged Smart Link.

00:07:55.330 --> 00:07:56.250
And I'm going to save that

00:07:56.272 --> 00:07:58.222
and then I'm also going to go over to our

00:07:59.362 --> 00:08:00.002
version of it.

00:08:00.002 --> 00:08:01.842
I'm going to do the update there as well.

00:08:02.002 --> 00:08:02.402
So

00:08:02.972 --> 00:08:04.092
our vite based,

00:08:04.172 --> 00:08:04.732
you are

00:08:05.372 --> 00:08:07.692
based host is now going to be

00:08:08.092 --> 00:08:09.256
smartlink.com

00:08:09.256 --> 00:08:11.814
and then I'm also going to make sure I have that

00:08:11.814 --> 00:08:15.254
updated inside of our EMV files just so if we

00:08:15.254 --> 00:08:18.374
deploy locally and not from the actual build,

00:08:18.854 --> 00:08:20.934
all of these variables are going to be

00:08:21.154 --> 00:08:22.274
propagated as expected.

00:08:22.514 --> 00:08:24.314
So make sure this is stage.

00:08:24.314 --> 00:08:26.114
We're going to make sure that this one is just the

00:08:26.114 --> 00:08:27.274
normal base URL.

00:08:27.274 --> 00:08:29.074
Now this is kind of one thing to note.

00:08:29.394 --> 00:08:31.154
You should probably pick if you're actually

00:08:31.684 --> 00:08:33.804
building for a production application,

00:08:33.804 --> 00:08:35.124
you should kind of pick how you're going to do

00:08:35.124 --> 00:08:35.284
this.

00:08:35.284 --> 00:08:35.844
I would suggest

00:08:36.484 --> 00:08:39.244
not ever actually deploying from your local just

00:08:39.244 --> 00:08:39.524
because

00:08:39.924 --> 00:08:41.484
you're going to have to make sure all of the

00:08:41.484 --> 00:08:43.844
variables are configured inside of here,

00:08:44.221 --> 00:08:46.420
like the correct way and then also inside the

00:08:46.420 --> 00:08:48.221
Cloudflare and like keeping those things aligned

00:08:48.221 --> 00:08:49.021
can be very tedious.

00:08:49.021 --> 00:08:50.781
But just for the purpose of time,

00:08:51.181 --> 00:08:52.541
I'm going to be deploying,

00:08:52.661 --> 00:08:53.809
I'm going to be deploying

00:08:53.809 --> 00:08:54.750
from the cli,

00:08:54.750 --> 00:08:57.170
but I would just say rely on the build deploys

00:08:57.170 --> 00:08:58.610
if you're actually building for production.

00:09:00.153 --> 00:09:00.553
All right,

00:09:00.793 --> 00:09:01.833
so that went through.

00:09:02.233 --> 00:09:04.793
We should be able to head back over to our

00:09:05.833 --> 00:09:05.913
stage,

00:09:05.913 --> 00:09:08.673
um.smartlink.com reload that guy.

00:09:08.673 --> 00:09:09.753
And now we are connected.

00:09:09.993 --> 00:09:11.283
I'm just going to go ahead and deploy the

00:09:11.283 --> 00:09:12.593
production version of this as well.

00:09:15.763 --> 00:09:17.923
And while that's going we can also take a look at

00:09:17.923 --> 00:09:18.243
our

00:09:18.283 --> 00:09:19.763
we can also take a look at our data service.

00:09:21.283 --> 00:09:21.683
So

00:09:22.163 --> 00:09:24.043
to start with we're also going to do a custom

00:09:24.043 --> 00:09:24.803
domain here

00:09:25.763 --> 00:09:26.963
and I'm going to

00:09:27.843 --> 00:09:30.323
come to our wrangler JSON for our data service

00:09:30.803 --> 00:09:32.323
and I'm going to start with production.

00:09:32.403 --> 00:09:33.443
We can go route

00:09:35.123 --> 00:09:36.563
and inside of routes.

00:09:36.643 --> 00:09:37.283
Let's take a,

00:09:37.283 --> 00:09:39.203
let's go custom domain is going to be true

00:09:39.863 --> 00:09:42.183
and what I'm going to say is this is going to be

00:09:42.583 --> 00:09:45.543
go.smartlink.com

00:09:46.263 --> 00:09:48.423
so this is going to be the short link that we use

00:09:48.634 --> 00:09:49.034
and

00:09:49.104 --> 00:09:51.014
I just have to make sure I'm providing it the

00:09:51.014 --> 00:09:51.765
actual pattern here.

00:09:52.666 --> 00:09:54.586
And we can go ahead and say pnpm,

00:09:54.586 --> 00:09:54.906
run,

00:09:55.946 --> 00:09:56.626
production,

00:09:56.626 --> 00:09:57.226
deploy.

00:09:58.046 --> 00:09:58.526
All right,

00:09:58.926 --> 00:10:01.246
so that successfully deployed.

00:10:02.076 --> 00:10:03.636
I'm just gonna base.

00:10:03.636 --> 00:10:04.436
So this is a.

00:10:04.436 --> 00:10:07.076
This used to be the redirect URL that we would

00:10:07.076 --> 00:10:07.356
use,

00:10:07.356 --> 00:10:10.036
but now it's no longer working because we are

00:10:10.036 --> 00:10:11.276
actually using a,

00:10:11.996 --> 00:10:13.796
we have our own domain associated with this.

00:10:13.796 --> 00:10:14.476
So I'm going to go

00:10:14.926 --> 00:10:18.606
go.smartlink.com

00:10:19.218 --> 00:10:21.658
and it looks like the destination is not found and

00:10:21.658 --> 00:10:23.378
that is because this destination actually doesn't

00:10:23.378 --> 00:10:23.778
exist.

00:10:23.788 --> 00:10:25.628
because we haven't done any of them in production.

00:10:25.628 --> 00:10:27.348
So we could also come into stage.

00:10:27.348 --> 00:10:29.108
So I'm going to do the same thing inside of stage

00:10:29.214 --> 00:10:30.414
and I'm going to go routes

00:10:32.252 --> 00:10:34.092
and inside of routes we can say

00:10:36.012 --> 00:10:37.292
custom domain is true.

00:10:38.812 --> 00:10:40.252
Pattern is going to be

00:10:41.322 --> 00:10:42.842
This is where we're going to make it a little bit

00:10:42.842 --> 00:10:43.042
different.

00:10:43.042 --> 00:10:50.922
So we're going to say go-stage.smartlink.com

00:10:52.281 --> 00:10:54.281
and I'm going to go ahead and PNPM

00:10:54.921 --> 00:10:55.321
run

00:10:56.361 --> 00:10:56.881
stage,

00:10:56.881 --> 00:10:57.481
deploy

00:10:59.255 --> 00:11:01.335
and we're going to go to go

00:11:01.655 --> 00:11:02.935
and I'm going to say dash

00:11:03.300 --> 00:11:03.644
So

00:11:04.449 --> 00:11:05.330
we called this

00:11:06.130 --> 00:11:06.530
go

00:11:07.090 --> 00:11:07.570
stage.

00:11:07.570 --> 00:11:08.050
So go

00:11:08.690 --> 00:11:10.290
stage smartlink.com

00:11:10.337 --> 00:11:13.617
and it looks like the DNS is still propagating,

00:11:13.777 --> 00:11:16.577
so we're going to give it just two more minutes.

00:11:16.847 --> 00:11:17.207
All right,

00:11:17.207 --> 00:11:17.967
it just went through.

00:11:17.967 --> 00:11:20.207
So it took about just less than a minute for the

00:11:20.207 --> 00:11:21.287
DNS to fully,

00:11:21.287 --> 00:11:22.087
register this.

00:11:22.087 --> 00:11:22.647
But now

00:11:23.047 --> 00:11:24.327
this redirects to Google,

00:11:24.327 --> 00:11:24.887
which is expected.

00:11:25.127 --> 00:11:25.527
So,

00:11:25.767 --> 00:11:27.227
we have our custom domains working,

00:11:27.467 --> 00:11:29.787
but now what if we wanted to do something more

00:11:29.787 --> 00:11:32.507
along the lines of like we wanted our smart link

00:11:32.507 --> 00:11:34.507
to actually be very short and we didn't want to

00:11:34.507 --> 00:11:35.787
have some type of subdomain.

00:11:35.867 --> 00:11:36.967
We could also do that.

00:11:36.967 --> 00:11:38.367
and there's a few different strategies here.

00:11:38.367 --> 00:11:40.367
So what we're going to do is we're going to first

00:11:40.367 --> 00:11:41.287
basically say,

00:11:41.467 --> 00:11:42.187
we're going to change

00:11:42.587 --> 00:11:43.467
custom domain.

00:11:43.467 --> 00:11:44.987
We're going to call this zone name

00:11:45.657 --> 00:11:47.337
and the zone is just the,

00:11:48.857 --> 00:11:49.108
the

00:11:49.298 --> 00:11:52.098
domain name that you have onboarded to Cloudflare.

00:11:52.338 --> 00:11:54.538
And then the pattern is going to be something like

00:11:54.538 --> 00:11:54.778
this.

00:11:54.778 --> 00:11:56.658
So we're going to basically say smart link.

00:11:57.058 --> 00:11:58.577
Now if you do star,

00:11:58.738 --> 00:12:01.378
this is going to cause some misconfiguration

00:12:01.458 --> 00:12:02.338
because your

00:12:02.738 --> 00:12:05.858
user application is also configured to basically

00:12:05.858 --> 00:12:07.058
have anything at smart.

00:12:07.138 --> 00:12:07.808
At smart,

00:12:07.938 --> 00:12:08.538
smart link.

00:12:08.538 --> 00:12:08.978
So like,

00:12:09.058 --> 00:12:11.498
this is where the business logic of your

00:12:11.498 --> 00:12:13.058
application is really important.

00:12:13.218 --> 00:12:14.338
Like for our,

00:12:15.218 --> 00:12:16.698
for our smart Links.

00:12:16.698 --> 00:12:18.658
We're just having these like random,

00:12:19.580 --> 00:12:21.076
we're just having these like random,

00:12:25.050 --> 00:12:25.950
these random

00:12:26.160 --> 00:12:27.920
specific IDs at the very end.

00:12:28.250 --> 00:12:28.490
And

00:12:29.210 --> 00:12:31.610
this kind of makes pattern matching really tricky.

00:12:31.690 --> 00:12:33.690
So you can imagine that we have.

00:12:34.890 --> 00:12:34.920
You

00:12:35.040 --> 00:12:37.320
can imagine that like if we were to basically say

00:12:37.320 --> 00:12:37.960
all of our

00:12:37.981 --> 00:12:40.780
short links are going to start with like the same

00:12:41.018 --> 00:12:41.588
prefix,

00:12:41.987 --> 00:12:43.108
you could say like,

00:12:43.748 --> 00:12:45.148
like whatever prefix.

00:12:45.148 --> 00:12:46.350
Let's just say you have like

00:12:46.354 --> 00:12:47.024
smt

00:12:47.504 --> 00:12:50.584
and then everything after SMT is going to be

00:12:50.584 --> 00:12:52.344
specific to like your smart link.

00:12:52.344 --> 00:12:52.664
You know,

00:12:52.664 --> 00:12:53.944
you could do something like that or you could say

00:12:53.944 --> 00:12:54.944
they all start with R.

00:12:55.104 --> 00:12:57.324
This would just be tricky because if you had a,

00:12:57.724 --> 00:13:00.004
a specific path in your application that started

00:13:00.004 --> 00:13:00.564
with R,

00:13:00.564 --> 00:13:02.364
it would go to the backend service and not the

00:13:02.364 --> 00:13:02.924
front end service.

00:13:02.924 --> 00:13:05.244
So this is kind of where things get a little bit,

00:13:05.524 --> 00:13:07.274
tricky and you kind of have to commit to the

00:13:07.274 --> 00:13:08.514
pattern that you're going to want to follow.

00:13:08.754 --> 00:13:09.674
For our use case,

00:13:09.674 --> 00:13:11.114
what I'm going to do is I'm just going to head

00:13:11.114 --> 00:13:13.074
over to our data service

00:13:13.634 --> 00:13:15.794
and I'll go to the HONO application and

00:13:15.794 --> 00:13:18.434
essentially our redirect service is just looking

00:13:18.434 --> 00:13:20.114
at like the base path.

00:13:20.434 --> 00:13:22.114
But what I'm going to do is I'm going to say

00:13:22.354 --> 00:13:22.914
anything.

00:13:23.414 --> 00:13:25.254
We're just going to call this R for now.

00:13:27.334 --> 00:13:30.534
So anything at forward slash R is going to be

00:13:30.534 --> 00:13:33.974
redirected to our link service so we can come back

00:13:33.974 --> 00:13:35.254
to our Wrangler JSON

00:13:35.734 --> 00:13:37.014
and we're going to say R

00:13:37.334 --> 00:13:38.854
forward slash star.

00:13:39.254 --> 00:13:41.374
So anything with this path is actually going to be

00:13:41.374 --> 00:13:42.374
treated as a short link.

00:13:42.374 --> 00:13:44.414
And I mean it's not ideal that you have this path

00:13:44.414 --> 00:13:44.694
here.

00:13:44.944 --> 00:13:46.624
it would be nice if you just had like a random

00:13:46.624 --> 00:13:47.544
configuration here.

00:13:47.544 --> 00:13:49.864
So this just kind of gets into how like you decide

00:13:49.864 --> 00:13:51.104
to configure your routes.

00:13:51.104 --> 00:13:51.504
But,

00:13:52.074 --> 00:13:52.714
this should work.

00:13:52.714 --> 00:13:54.154
So I'm going to basically say,

00:13:54.324 --> 00:13:56.204
this is actually technically stage.

00:13:56.284 --> 00:13:58.524
So I'm still going to have stage here,

00:13:59.004 --> 00:14:00.204
which is totally okay.

00:14:00.444 --> 00:14:02.364
I'm going to copy this route over

00:14:03.004 --> 00:14:05.684
and we can come over to our production version of

00:14:05.684 --> 00:14:05.964
it.

00:14:05.964 --> 00:14:07.004
Just close this guy

00:14:07.488 --> 00:14:07.888
and

00:14:08.368 --> 00:14:09.168
I can

00:14:09.808 --> 00:14:10.208
say

00:14:10.578 --> 00:14:12.338
instead of stage we'll just go like this.

00:14:12.418 --> 00:14:12.818
So

00:14:13.698 --> 00:14:16.058
anything at forward slash R is going to direct

00:14:16.058 --> 00:14:16.378
there.

00:14:16.378 --> 00:14:18.338
I'm going to deploy stage because we actually have

00:14:18.338 --> 00:14:19.490
data in stage right now.

00:14:20.344 --> 00:14:20.824
All right,

00:14:20.984 --> 00:14:22.264
so our link is now

00:14:23.154 --> 00:14:24.914
R forward slash star.

00:14:24.994 --> 00:14:26.354
So instead of go

00:14:27.234 --> 00:14:27.994
dash stage,

00:14:27.994 --> 00:14:29.234
it's just going to be stage

00:14:30.250 --> 00:14:31.857
and then it's going to be R

00:14:32.897 --> 00:14:35.377
and then it's going to be the ID the link ID

00:14:35.572 --> 00:14:37.005
and that also goes to Google.

00:14:37.005 --> 00:14:37.365
So

00:14:37.765 --> 00:14:38.005
this is,

00:14:38.005 --> 00:14:39.765
this is how you do pattern matching with routes

00:14:39.765 --> 00:14:41.405
and you know you could build a really

00:14:41.405 --> 00:14:43.125
sophisticated service based upon that.

00:14:43.125 --> 00:14:45.765
But like a typical pattern that I have is like I

00:14:45.765 --> 00:14:49.125
have some API that has a bunch of backend logic on

00:14:49.125 --> 00:14:49.525
top of it.

00:14:49.525 --> 00:14:51.445
So I usually just say like anything forward slash

00:14:51.445 --> 00:14:54.645
API is going to go to like my data service and

00:14:54.645 --> 00:14:56.685
then everything else is going to like be managed

00:14:56.685 --> 00:14:57.205
by my

00:14:57.435 --> 00:14:58.185
front end service.

00:14:58.345 --> 00:14:58.745
So

00:14:58.955 --> 00:15:00.805
this is really up to you how you want to configure

00:15:00.805 --> 00:15:03.085
it and it's just worth playing around with because

00:15:03.085 --> 00:15:04.925
it can be a little bit tricky to like get the

00:15:04.925 --> 00:15:05.885
perfect configuration.

00:15:05.885 --> 00:15:07.485
But at the end of the day you really can build

00:15:07.485 --> 00:15:08.205
whatever you want.

00:15:08.365 --> 00:15:11.625
So in a nutshell that is custom domains and

00:15:11.785 --> 00:15:13.025
onboarding subdomains.

00:15:13.025 --> 00:15:13.865
So now from here,

00:15:14.265 --> 00:15:16.025
now that we kind of own our own domains,

00:15:16.025 --> 00:15:18.135
what we can do is we can start building out the

00:15:18.295 --> 00:15:18.935
actual

00:15:19.705 --> 00:15:21.515
we can start building out the actual like

00:15:21.515 --> 00:15:23.675
authentication of our application because you

00:15:23.675 --> 00:15:23.915
know,

00:15:23.915 --> 00:15:26.155
we have a real domain that we can go register with

00:15:26.155 --> 00:15:27.195
like Google and GitHub,

00:15:27.195 --> 00:15:29.155
whoever our auth provider is going to be.

