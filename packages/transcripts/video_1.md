WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.066 --> 00:00:00.386
All right,

00:00:00.386 --> 00:00:02.266
welcome to the full stack on cloudflare course.

00:00:02.266 --> 00:00:04.506
My name is Matthew Sessions and before we dive too

00:00:04.506 --> 00:00:05.266
deep into the content,

00:00:05.506 --> 00:00:07.346
I want to share a little bit about my background

00:00:07.346 --> 00:00:09.186
and why I created this course in the first place.

00:00:09.506 --> 00:00:11.946
So for the past six years I have been a

00:00:11.946 --> 00:00:13.266
professional software engineer.

00:00:13.496 --> 00:00:15.446
and I started my career focusing really,

00:00:15.446 --> 00:00:16.886
really deep on the back end side of things.

00:00:16.886 --> 00:00:18.646
I built out big data solutions,

00:00:18.646 --> 00:00:19.726
ETL jobs,

00:00:19.726 --> 00:00:21.446
built real time streaming applications

00:00:21.766 --> 00:00:24.326
and I did a lot of API like level work.

00:00:24.326 --> 00:00:24.726
Now,

00:00:24.966 --> 00:00:26.926
towards the end of my time at a big tech company,

00:00:26.926 --> 00:00:29.526
I started to dive deeper into the user facing

00:00:29.526 --> 00:00:29.806
stuff.

00:00:29.806 --> 00:00:32.006
So I started building GraphQL APIs that would

00:00:32.006 --> 00:00:34.486
interface with data that was spit out by our

00:00:34.486 --> 00:00:35.286
backend services.

00:00:35.526 --> 00:00:36.566
And then I started building

00:00:36.636 --> 00:00:38.316
react applications that were basically,

00:00:38.316 --> 00:00:38.596
you know,

00:00:38.596 --> 00:00:41.716
the interface to the entire data ecosystem that we

00:00:41.716 --> 00:00:42.996
built out and it was user facing,

00:00:42.996 --> 00:00:44.436
so users were using these applications.

00:00:44.436 --> 00:00:46.636
So I kind of worked not from the front end to the

00:00:46.636 --> 00:00:46.796
back,

00:00:46.796 --> 00:00:47.876
I worked from the back end to the front.

00:00:47.876 --> 00:00:48.716
And because of that,

00:00:48.896 --> 00:00:51.136
when I look at software and when I look at like

00:00:51.136 --> 00:00:52.136
building different solutions,

00:00:52.136 --> 00:00:54.816
I think of it from a data perspective and in a

00:00:54.816 --> 00:00:57.016
system perspective and then I map that to an

00:00:57.016 --> 00:00:57.296
experience

00:00:58.178 --> 00:00:59.098
and you know,

00:00:59.098 --> 00:01:01.018
I feel like I've gotten pretty good at building

00:01:01.018 --> 00:01:01.298
things,

00:01:01.298 --> 00:01:02.058
building things quickly,

00:01:02.058 --> 00:01:03.658
but also building things in a way where they're

00:01:03.658 --> 00:01:04.498
like maintainable,

00:01:04.498 --> 00:01:05.898
scalable from you know,

00:01:05.898 --> 00:01:07.098
a usage based perspective,

00:01:07.098 --> 00:01:09.058
but also from a maintainability perspective.

00:01:09.378 --> 00:01:09.938
and then,

00:01:10.178 --> 00:01:10.738
you know,

00:01:10.818 --> 00:01:13.738
after like five years of working at an enterprise

00:01:13.738 --> 00:01:13.898
level,

00:01:13.898 --> 00:01:15.618
I decided I was going to quit my job and I'm going

00:01:15.618 --> 00:01:17.098
to go like full in on doing,

00:01:17.098 --> 00:01:17.498
you know,

00:01:17.498 --> 00:01:18.098
contract work,

00:01:18.098 --> 00:01:19.618
consulting work and then you know,

00:01:19.618 --> 00:01:21.058
making a little bit of content here and there.

00:01:21.058 --> 00:01:22.658
So I started back Pine Labs,

00:01:22.678 --> 00:01:25.038
I started picking up different like contracts for

00:01:25.038 --> 00:01:26.638
midsize companies that are trying to build out

00:01:26.638 --> 00:01:27.478
software solutions.

00:01:27.494 --> 00:01:29.484
But I'm also a normal developer and you know,

00:01:29.484 --> 00:01:30.764
a normal typical developer,

00:01:30.764 --> 00:01:32.284
especially somebody that's working in the web

00:01:32.284 --> 00:01:32.564
space.

00:01:32.724 --> 00:01:34.484
You have a bunch of side projects and you want to

00:01:34.484 --> 00:01:36.004
build a whole bunch of stuff and you want to be

00:01:36.004 --> 00:01:37.444
able to host it and you want to host it cheap and

00:01:37.444 --> 00:01:38.644
you want to showcase what you're doing.

00:01:38.644 --> 00:01:39.004
You know,

00:01:39.004 --> 00:01:40.484
you want to like prove out different concepts.

00:01:40.484 --> 00:01:40.884
So like,

00:01:41.044 --> 00:01:42.404
I'm always doing like two things at once.

00:01:42.404 --> 00:01:44.084
I'm building out these things that I really enjoy

00:01:44.084 --> 00:01:44.644
working on,

00:01:44.724 --> 00:01:45.224
for myself.

00:01:45.224 --> 00:01:47.624
And then I'm also picking up contract jobs and

00:01:47.624 --> 00:01:49.104
building a business on top of like,

00:01:49.104 --> 00:01:49.344
you know,

00:01:49.344 --> 00:01:50.744
building out solutions for companies.

00:01:51.564 --> 00:01:53.604
Now throughout like the process of Building my own

00:01:53.604 --> 00:01:54.844
stuff and also building for companies,

00:01:54.924 --> 00:01:56.284
companies that like are mid sized,

00:01:56.284 --> 00:01:56.644
you know,

00:01:56.644 --> 00:01:56.924
doing

00:01:57.244 --> 00:01:59.764
between 500,000 to a couple million dollars in

00:01:59.764 --> 00:02:00.604
revenue every year.

00:02:00.604 --> 00:02:01.524
Not like you know,

00:02:01.524 --> 00:02:03.164
massive billion billion dollar companies.

00:02:03.404 --> 00:02:05.644
I try to find tooling and

00:02:05.844 --> 00:02:08.124
like a deployment infrastructure that is really

00:02:08.124 --> 00:02:09.364
suitable for their needs.

00:02:09.624 --> 00:02:11.464
and that's ultimately how I discovered Cloudflare.

00:02:11.464 --> 00:02:13.504
I discovered cloudflare because like I1 was like

00:02:13.504 --> 00:02:15.184
working on a bunch of stuff for like my indie

00:02:15.184 --> 00:02:17.904
projects and I wanted cheap hosting but then I

00:02:17.904 --> 00:02:19.624
also wanted something that was like really easy to

00:02:19.624 --> 00:02:20.204
work with for,

00:02:20.434 --> 00:02:20.994
for these

00:02:21.114 --> 00:02:23.014
companies so I could build stuff,

00:02:23.014 --> 00:02:23.814
train a team,

00:02:23.974 --> 00:02:25.174
pass it off to the team,

00:02:25.174 --> 00:02:25.534
you know,

00:02:25.534 --> 00:02:26.729
once like my work is done.

00:02:26.746 --> 00:02:28.346
And I've noticed there's a lot of like web

00:02:28.346 --> 00:02:28.746
developers,

00:02:28.746 --> 00:02:29.986
people that are like more front end,

00:02:29.986 --> 00:02:30.906
a little bit back end,

00:02:31.246 --> 00:02:31.886
focused

00:02:32.206 --> 00:02:34.526
where if you like are going to build a whole bunch

00:02:34.526 --> 00:02:35.086
of like

00:02:35.566 --> 00:02:35.966
services

00:02:36.366 --> 00:02:38.366
on top of different products on top of aws,

00:02:38.526 --> 00:02:39.086
it's really,

00:02:39.086 --> 00:02:40.286
really hard to transfer that knowledge.

00:02:40.286 --> 00:02:42.126
There's just like a really steep learning curve

00:02:42.126 --> 00:02:43.846
where if you're not doing it at an enterprise

00:02:43.846 --> 00:02:45.966
level you're probably not going to go deep enough

00:02:45.966 --> 00:02:48.526
into AWS for like hosting your projects and also

00:02:48.526 --> 00:02:50.206
for side projects it's really expensive.

00:02:50.916 --> 00:02:53.676
Now like the alternatives is to roll your own vpss

00:02:53.676 --> 00:02:55.036
and like you could always go that route but

00:02:55.036 --> 00:02:57.396
there's also a lot of complexity there or use

00:02:57.396 --> 00:03:00.081
managed hosting providers like Netlify or Vercel.

00:03:00.398 --> 00:03:02.038
Providers like Netlify and Vercel are really

00:03:02.038 --> 00:03:02.278
great.

00:03:02.278 --> 00:03:04.238
Honestly pricing in my opinion is fine.

00:03:04.318 --> 00:03:04.878
They're really,

00:03:04.878 --> 00:03:06.278
really easy to build on top of.

00:03:06.278 --> 00:03:07.918
But what I've noticed is

00:03:08.318 --> 00:03:10.118
most developers or like you know,

00:03:10.118 --> 00:03:11.198
people building indie product,

00:03:12.078 --> 00:03:13.998
they'll kind of like spin up a next JS app,

00:03:14.078 --> 00:03:15.198
they'll have a database,

00:03:15.478 --> 00:03:17.198
they'll do a bunch of crud operations and it's

00:03:17.198 --> 00:03:17.358
very,

00:03:17.358 --> 00:03:18.170
very simple in nature.

00:03:18.212 --> 00:03:20.292
Now the second the project grows and they're

00:03:20.292 --> 00:03:21.972
trying to like accommodate different like more use

00:03:21.972 --> 00:03:22.292
cases,

00:03:22.292 --> 00:03:23.732
especially in the world of AI,

00:03:23.892 --> 00:03:25.172
they're finding like oh this,

00:03:25.172 --> 00:03:26.932
this model of like ui,

00:03:27.012 --> 00:03:27.572
API,

00:03:27.572 --> 00:03:27.892
call,

00:03:28.292 --> 00:03:29.252
go to database,

00:03:29.252 --> 00:03:31.572
get data isn't like the only thing that they're

00:03:31.572 --> 00:03:31.772
doing.

00:03:31.772 --> 00:03:33.412
All of a sudden they're having to run like,

00:03:33.412 --> 00:03:35.492
they're having to manage long running tasks on the

00:03:35.492 --> 00:03:35.892
background,

00:03:36.292 --> 00:03:37.732
they're having to like do a whole bunch of

00:03:37.732 --> 00:03:39.092
different like really smart

00:03:39.542 --> 00:03:41.712
connected workflows where it's really task based.

00:03:41.889 --> 00:03:44.329
And for developers that build their projects on

00:03:44.329 --> 00:03:45.649
top of like these managed services,

00:03:45.729 --> 00:03:47.889
what happens is like oh well Vercel doesn't solve

00:03:47.889 --> 00:03:48.409
my need here.

00:03:48.409 --> 00:03:49.809
So here's another managed service.

00:03:49.809 --> 00:03:51.409
I'm going to go pay like $10 a month and I'm going

00:03:51.409 --> 00:03:52.289
to use this

00:03:52.429 --> 00:03:55.249
trigger.dev to manage my background tasks or you

00:03:55.249 --> 00:03:55.369
know,

00:03:55.369 --> 00:03:56.049
I'm going to go grab,

00:03:56.049 --> 00:03:57.529
I'm going to use up stash and I'm going to use

00:03:57.529 --> 00:03:59.569
their like really cheap Redis cluster because you

00:03:59.569 --> 00:03:59.689
know,

00:03:59.689 --> 00:04:01.169
I need a better caching solution that,

00:04:01.169 --> 00:04:03.449
that like Vercel isn't covering or Netlify isn't

00:04:03.449 --> 00:04:03.849
covering.

00:04:04.249 --> 00:04:05.169
And then you know,

00:04:05.169 --> 00:04:06.529
after like a year of working on it,

00:04:06.529 --> 00:04:08.089
all of a sudden the code base is just one,

00:04:08.089 --> 00:04:08.649
you know,

00:04:09.049 --> 00:04:11.529
one big Next JS app with a whole bunch of files

00:04:11.609 --> 00:04:13.849
that kind of ship a little bit of code to a whole

00:04:13.849 --> 00:04:15.969
bunch of different like dependent services and it

00:04:15.969 --> 00:04:17.929
becomes really hard to manage and also like it's

00:04:17.929 --> 00:04:18.569
really hard to

00:04:18.889 --> 00:04:20.809
scale it in terms of volume because a lot of these

00:04:20.809 --> 00:04:22.129
like managed providers,

00:04:22.129 --> 00:04:23.769
once you actually hit a critical number of users

00:04:23.769 --> 00:04:24.728
they become very expensive.

00:04:24.728 --> 00:04:25.489
But you know,

00:04:25.489 --> 00:04:26.289
also like you're,

00:04:26.289 --> 00:04:28.089
you're reaching for a lot of different solutions.

00:04:28.409 --> 00:04:30.929
And to me Cloudflare sits like right in the middle

00:04:30.929 --> 00:04:33.529
of AWS and Vercel where you

00:04:33.849 --> 00:04:36.049
have like a whole bunch of different products that

00:04:36.049 --> 00:04:37.769
you can develop on to solve different types of

00:04:37.769 --> 00:04:38.169
problems.

00:04:38.679 --> 00:04:38.919
But

00:04:39.299 --> 00:04:39.719
the development

00:04:40.039 --> 00:04:42.199
experience in my opinion is closer to

00:04:42.519 --> 00:04:42.919
like

00:04:43.009 --> 00:04:44.489
a Vercel where you know,

00:04:44.489 --> 00:04:46.649
it's not as easy to develop on as Vercel but there

00:04:46.649 --> 00:04:48.129
is still a lot of like ease of use.

00:04:48.449 --> 00:04:50.369
but you're just not overwhelmed by having

00:04:50.609 --> 00:04:52.569
thousands and thousands of different services like

00:04:52.569 --> 00:04:53.632
AWS to choose from.

00:04:53.632 --> 00:04:55.520
And then there's obviously like the pricing

00:04:55.520 --> 00:04:55.920
factor.

00:04:55.920 --> 00:04:57.240
So there's the ease of use and then there's a

00:04:57.240 --> 00:04:58.920
pricing and I feel like Cloudflare,

00:04:58.920 --> 00:05:01.360
if you look at like how much a request costs,

00:05:01.360 --> 00:05:03.560
how much they charge for like the duration of your

00:05:03.560 --> 00:05:04.000
request,

00:05:04.300 --> 00:05:05.180
if you do the math,

00:05:05.180 --> 00:05:05.660
it's really,

00:05:05.660 --> 00:05:05.940
really,

00:05:05.940 --> 00:05:08.220
really hard to beat the price of Cloudflare.

00:05:08.440 --> 00:05:09.020
Now none

00:05:09.100 --> 00:05:11.020
of the managed services can get close to the price

00:05:11.180 --> 00:05:13.820
and the only way you can like justify saying oh,

00:05:13.820 --> 00:05:16.300
AWS is cheaper is if like you have

00:05:16.620 --> 00:05:18.740
millions and millions and millions upon requests

00:05:18.740 --> 00:05:21.180
and you're handling them on just like solid

00:05:21.580 --> 00:05:23.880
EC2 instances that are deployed on top of

00:05:23.880 --> 00:05:26.550
on top of AWS and you're optimizing your use case

00:05:26.550 --> 00:05:27.390
for handling that

00:05:27.710 --> 00:05:29.070
for the vast majority of

00:05:29.730 --> 00:05:31.510
problems that like developers are solving from

00:05:31.510 --> 00:05:32.830
like the indie stuff

00:05:33.250 --> 00:05:34.930
all the way to like you know,

00:05:34.930 --> 00:05:36.050
past mid sized companies,

00:05:36.050 --> 00:05:37.930
like companies that are actually doing Serious

00:05:37.930 --> 00:05:38.370
scale,

00:05:38.450 --> 00:05:40.850
but not quite like these juggernauts of companies

00:05:40.850 --> 00:05:43.250
like Facebook and Amazon and whatnot.

00:05:44.770 --> 00:05:46.330
Cloudflare is a perfect solution.

00:05:46.330 --> 00:05:46.570
Like,

00:05:46.570 --> 00:05:47.530
I honestly think they're,

00:05:47.530 --> 00:05:48.610
they're probably,

00:05:48.610 --> 00:05:51.010
they should be a go to hosting provider for

00:05:51.730 --> 00:05:53.490
probably 80% of

00:05:53.580 --> 00:05:55.530
web services that are built or maybe even more

00:05:55.530 --> 00:05:57.970
because really like the tail end is are these

00:05:58.210 --> 00:06:00.010
large companies that are solving like data

00:06:00.010 --> 00:06:00.360
problems,

00:06:00.360 --> 00:06:02.070
you and I just really can't even like wrap our

00:06:02.070 --> 00:06:03.390
heads around unless we're really,

00:06:03.390 --> 00:06:03.630
really,

00:06:03.630 --> 00:06:04.270
really deep into.

00:06:05.770 --> 00:06:07.330
So that's kind of why I wanted to create this

00:06:07.330 --> 00:06:08.530
course is I think that,

00:06:08.530 --> 00:06:09.050
you know,

00:06:09.050 --> 00:06:10.250
people that are learning to develop,

00:06:10.410 --> 00:06:12.450
they can learn really good development principles

00:06:12.450 --> 00:06:13.690
by shipping code to

00:06:14.010 --> 00:06:15.810
Cloudflare because you have a lot of compute

00:06:15.810 --> 00:06:17.330
primitives you can build upon and we'll talk about

00:06:17.330 --> 00:06:18.040
them in just a minute.

00:06:18.659 --> 00:06:21.179
But also as projects grow and you know,

00:06:21.179 --> 00:06:22.899
they turn into businesses and they're actually

00:06:22.899 --> 00:06:23.779
making serious money,

00:06:23.859 --> 00:06:24.979
they can scale for a very,

00:06:24.979 --> 00:06:25.779
very long time,

00:06:25.779 --> 00:06:26.739
if not forever,

00:06:27.169 --> 00:06:28.529
to kind of meet those needs.

00:06:30.299 --> 00:06:32.859
Now probably the one downside of Cloudflare is,

00:06:33.069 --> 00:06:34.515
I don't necessarily agree with it,

00:06:34.515 --> 00:06:36.035
but a lot of people out there are like,

00:06:36.035 --> 00:06:36.235
oh,

00:06:36.235 --> 00:06:37.435
the documentation's too hard.

00:06:37.435 --> 00:06:38.715
There's not enough examples online.

00:06:38.795 --> 00:06:40.435
I don't really know how to like get started with

00:06:40.435 --> 00:06:40.555
it.

00:06:40.555 --> 00:06:42.075
And that's ultimately where this course came from.

00:06:42.155 --> 00:06:44.034
I personally feel like the documentation is pretty

00:06:44.034 --> 00:06:44.315
good.

00:06:44.635 --> 00:06:44.745
I

00:06:44.775 --> 00:06:46.495
can read through the documentation and I can

00:06:46.495 --> 00:06:48.615
understand like how to use a product and then ship

00:06:48.615 --> 00:06:48.895
very,

00:06:48.895 --> 00:06:50.935
very quickly just by skimming the documentation.

00:06:50.935 --> 00:06:53.775
But I do know if you aren't really deep in this

00:06:53.775 --> 00:06:54.015
space,

00:06:54.265 --> 00:06:55.015
and if you haven't like,

00:06:55.015 --> 00:06:56.415
you don't have a lot of like repetitions building

00:06:56.415 --> 00:06:57.215
on top of Cloudflare,

00:06:57.215 --> 00:06:57.695
it can be very,

00:06:57.695 --> 00:06:58.295
very daunting.

00:06:58.295 --> 00:06:58.655
So

00:06:59.085 --> 00:07:00.925
what this course is going to do is it's going to

00:07:00.925 --> 00:07:04.245
be geared towards like one showing how to build a

00:07:04.245 --> 00:07:05.005
SaaS product

00:07:05.405 --> 00:07:06.605
as a series of services,

00:07:06.685 --> 00:07:08.925
like layers of compute responsibilities.

00:07:09.565 --> 00:07:11.365
And it's going to show how to take these concepts

00:07:11.365 --> 00:07:12.925
and these services and these systems that we're

00:07:12.925 --> 00:07:13.635
building and

00:07:13.635 --> 00:07:14.405
we're going to,

00:07:14.405 --> 00:07:16.725
and it's basically going to show how to deploy

00:07:16.725 --> 00:07:18.245
them and run them on Cloudflare.

00:07:18.645 --> 00:07:21.125
Now this isn't like a Learn Framework X,

00:07:21.125 --> 00:07:23.725
this isn't a Learn Next or Learn Tensex Start or

00:07:23.725 --> 00:07:25.365
Learn Learn Nuxt course.

00:07:25.735 --> 00:07:28.575
This also isn't an intro into building like a full

00:07:28.575 --> 00:07:29.255
stack app.

00:07:29.895 --> 00:07:33.615
This is much more like a overview and a deep dive

00:07:33.615 --> 00:07:35.735
into how to build like SaaS services.

00:07:36.695 --> 00:07:37.415
So the content,

00:07:37.415 --> 00:07:39.095
even though it's like 11 hours long,

00:07:39.255 --> 00:07:40.415
is going to move pretty quick.

00:07:40.415 --> 00:07:42.095
We're not going to be typing side by side,

00:07:42.095 --> 00:07:42.855
line by line.

00:07:42.855 --> 00:07:44.375
I'm going to have a whole bunch of like,

00:07:44.375 --> 00:07:46.455
code that I move over into the project,

00:07:46.535 --> 00:07:47.975
we go over what it does,

00:07:48.135 --> 00:07:49.415
and then we're going to like,

00:07:49.415 --> 00:07:49.935
talk about,

00:07:49.935 --> 00:07:50.335
you know,

00:07:50.335 --> 00:07:51.055
why we're doing it,

00:07:51.055 --> 00:07:51.455
the certain,

00:07:51.455 --> 00:07:51.695
like,

00:07:51.695 --> 00:07:52.295
why we're coding,

00:07:52.295 --> 00:07:53.135
the way we're coding,

00:07:53.135 --> 00:07:53.495
why,

00:07:53.575 --> 00:07:55.575
why we're implementing things in a specific way.

00:07:55.655 --> 00:07:57.175
And then we're going to be showing how to use

00:07:57.555 --> 00:07:57.835
compute,

00:07:57.835 --> 00:07:59.375
primitives on top of Cloudflare.

00:07:59.775 --> 00:08:00.695
And because of that,

00:08:00.695 --> 00:08:03.055
we're able to cover a lot in 11 hours.

00:08:03.055 --> 00:08:05.215
I think if you compare it to most 11 hour courses,

00:08:05.295 --> 00:08:08.375
it's probably going to cover like 70% more than

00:08:08.375 --> 00:08:09.335
what it typically would.

00:08:09.335 --> 00:08:10.495
But just be prepared,

00:08:10.495 --> 00:08:11.335
like these things,

00:08:11.335 --> 00:08:11.575
like,

00:08:11.575 --> 00:08:12.415
we might be moving really,

00:08:12.415 --> 00:08:13.055
really quickly.

00:08:13.295 --> 00:08:14.095
and you just need to know,

00:08:14.095 --> 00:08:14.295
like,

00:08:14.295 --> 00:08:15.135
if you aren't,

00:08:15.295 --> 00:08:15.815
you know,

00:08:15.815 --> 00:08:18.095
like super familiar with a specific technology

00:08:18.175 --> 00:08:18.895
that we're using,

00:08:19.135 --> 00:08:19.815
that's okay.

00:08:19.815 --> 00:08:21.255
We're going to talk about why we're using it,

00:08:21.255 --> 00:08:22.015
how we're using it,

00:08:22.415 --> 00:08:22.775
how,

00:08:22.775 --> 00:08:23.415
how we're using it,

00:08:23.415 --> 00:08:23.975
and then you can,

00:08:23.975 --> 00:08:24.295
you know,

00:08:24.295 --> 00:08:25.375
link off on your own time,

00:08:25.715 --> 00:08:27.555
read about it and understand like that specific

00:08:27.555 --> 00:08:28.355
technology later.

00:08:28.355 --> 00:08:29.875
But what we're trying to do is we're trying to

00:08:29.875 --> 00:08:29.995
like,

00:08:29.995 --> 00:08:32.155
gain a holistic understanding of a service because

00:08:32.155 --> 00:08:32.915
by the end of this,

00:08:32.915 --> 00:08:34.755
you're going to see how everything comes together

00:08:34.915 --> 00:08:34.937
and

00:08:35.251 --> 00:08:37.171
And it's going to empower you to be able to build

00:08:37.171 --> 00:08:39.091
your own services in the future if you want to,

00:08:39.091 --> 00:08:39.211
like,

00:08:39.211 --> 00:08:40.291
go out and do your own project.

00:08:40.451 --> 00:08:41.971
So I really believe in the content,

00:08:41.971 --> 00:08:43.651
I really believe in the content on this course.

00:08:43.741 --> 00:08:44.861
I think that it's going to be very,

00:08:44.861 --> 00:08:45.501
very useful.

00:08:45.501 --> 00:08:46.181
So I'd say just,

00:08:46.181 --> 00:08:47.021
just stick with it,

00:08:47.180 --> 00:08:47.981
get through the end,

00:08:47.981 --> 00:08:49.981
and by the end you're going to have a really,

00:08:49.981 --> 00:08:51.581
really good understanding of how to develop,

00:08:51.771 --> 00:08:53.201
how to ship to Cloudflare,

00:08:53.201 --> 00:08:55.241
how to use these services and how to solve

00:08:55.241 --> 00:08:55.601
problems,

00:08:55.601 --> 00:08:56.841
which is the most important thing.

00:08:57.009 --> 00:08:58.105
So enough of my rambling,

00:08:58.105 --> 00:09:00.465
let's kind of get into exactly what this course is

00:09:00.465 --> 00:09:01.225
going to entail.

00:09:01.225 --> 00:09:03.505
So the end product of this course is going to be

00:09:03.505 --> 00:09:06.065
this really simple UI where you have a dashboard.

00:09:06.065 --> 00:09:07.465
And essentially what this UI is,

00:09:07.465 --> 00:09:08.265
is it is a,

00:09:08.335 --> 00:09:11.225
dashboard to track link clicks for some type of

00:09:11.225 --> 00:09:11.545
like,

00:09:11.625 --> 00:09:14.145
smart routing system for short links.

00:09:14.145 --> 00:09:14.495
So

00:09:14.585 --> 00:09:15.025
if you,

00:09:15.025 --> 00:09:15.705
if you've seen,

00:09:15.710 --> 00:09:16.819
if you've seen like Bitly,

00:09:16.819 --> 00:09:18.259
that's been around for a long time,

00:09:18.259 --> 00:09:18.859
it's just a short,

00:09:18.859 --> 00:09:19.619
a link shortening,

00:09:19.619 --> 00:09:20.979
which is basically just redirecting.

00:09:20.979 --> 00:09:22.379
But it has a few caveats.

00:09:22.459 --> 00:09:22.859
Now,

00:09:23.249 --> 00:09:24.649
if you come through this process,

00:09:24.649 --> 00:09:26.369
like you can go ahead and you can create a link,

00:09:26.369 --> 00:09:28.049
you can pass in a link and you can create

00:09:28.119 --> 00:09:29.419
like this short link.

00:09:29.419 --> 00:09:31.739
And essentially what happens here is you can say,

00:09:31.739 --> 00:09:32.059
okay,

00:09:32.059 --> 00:09:34.059
so like this link is going to redirect to this

00:09:34.059 --> 00:09:34.619
URL,

00:09:34.619 --> 00:09:38.659
but if I want to say everybody in Albania

00:09:38.979 --> 00:09:40.179
is going to go to,

00:09:40.179 --> 00:09:42.659
let's say they're going to go to the Cloudflare

00:09:42.659 --> 00:09:43.379
documentation.

00:09:44.659 --> 00:09:46.339
So these are just like really simple basic CRUD

00:09:46.339 --> 00:09:46.899
operations.

00:09:47.739 --> 00:09:48.539
then you have,

00:09:48.539 --> 00:09:49.619
whenever you create a link,

00:09:49.619 --> 00:09:50.939
you can go ahead and you can see it here,

00:09:51.099 --> 00:09:52.059
you can click on it,

00:09:52.359 --> 00:09:54.279
you can edit stuff and whatnot.

00:09:54.519 --> 00:09:55.559
But what makes this really,

00:09:55.559 --> 00:09:57.679
really special is like we're going to be building

00:09:57.679 --> 00:10:00.286
out a back end implementation on top of this.

00:10:00.374 --> 00:10:02.904
That does more than just link redirects.

00:10:02.904 --> 00:10:05.114
so we have this geo based one where we're going to

00:10:05.114 --> 00:10:05.994
be able to say like,

00:10:05.994 --> 00:10:06.314
oh,

00:10:06.314 --> 00:10:08.354
links in this destination should go to this URL.

00:10:08.354 --> 00:10:10.354
But we're also going to build out some logic where

00:10:10.354 --> 00:10:11.313
when links are clicked,

00:10:11.313 --> 00:10:13.434
we're going to have a series of services that run

00:10:13.514 --> 00:10:13.914
and

00:10:14.344 --> 00:10:16.734
they kind of process like the end destination

00:10:17.054 --> 00:10:19.134
and they use AI to like.

00:10:19.214 --> 00:10:19.494
Well,

00:10:19.494 --> 00:10:21.294
they use browser rendering to render the page in

00:10:21.294 --> 00:10:21.854
the background

00:10:22.264 --> 00:10:24.134
and to view the contents of the page and then to

00:10:24.134 --> 00:10:24.974
like tag like hey,

00:10:24.974 --> 00:10:26.374
is this product unavailable or not?

00:10:26.374 --> 00:10:27.934
Or is this page healthy and whatnot.

00:10:27.934 --> 00:10:28.254
So

00:10:28.374 --> 00:10:30.654
there's like this extra layer to it where there's

00:10:30.654 --> 00:10:32.214
like the smart component that's running in the

00:10:32.214 --> 00:10:33.894
background feeding into the system.

00:10:34.304 --> 00:10:36.384
Now obviously we're also going to have

00:10:37.264 --> 00:10:37.864
a little bit,

00:10:37.864 --> 00:10:39.104
a little section about payments.

00:10:39.104 --> 00:10:40.784
So like how to like integrate payments into the

00:10:40.784 --> 00:10:41.464
SaaS application,

00:10:41.464 --> 00:10:42.944
how that fits into our data model.

00:10:43.104 --> 00:10:43.504
And

00:10:43.904 --> 00:10:45.504
we are also going to have like auth,

00:10:45.504 --> 00:10:46.104
we're going to roll,

00:10:46.104 --> 00:10:47.984
we're going to roll our own auth using better Auth

00:10:47.984 --> 00:10:48.234
as well.

00:10:48.384 --> 00:10:48.544
Well,

00:10:48.544 --> 00:10:50.034
so like we're going to go end to end with it.

00:10:50.034 --> 00:10:52.144
but the main focus isn't going to be payments or

00:10:52.144 --> 00:10:52.784
authentication,

00:10:52.784 --> 00:10:55.184
it's going to be how do we build like the entire

00:10:55.184 --> 00:10:55.504
system.

00:10:55.934 --> 00:10:57.124
and to kind of make that a little bit more

00:10:57.124 --> 00:10:57.464
concrete,

00:10:57.464 --> 00:10:59.970
we can go ahead and look at the starter repo.

00:10:59.970 --> 00:11:01.290
So ultimately what you're going to do is you're

00:11:01.290 --> 00:11:02.769
going to fork this and I'm going to have links in

00:11:02.769 --> 00:11:03.880
it and the next video is going to go

00:11:03.880 --> 00:11:04.890
through this entire process.

00:11:04.890 --> 00:11:05.290
But,

00:11:05.700 --> 00:11:07.720
essentially you're going to notice that if you

00:11:07.720 --> 00:11:09.160
look at this application and you're,

00:11:09.160 --> 00:11:10.960
let's say you're used to working in Next js,

00:11:11.040 --> 00:11:12.880
the structure of this project looks different.

00:11:12.880 --> 00:11:14.880
You don't just have a source and a whole bunch of

00:11:14.880 --> 00:11:16.240
different configuration files here.

00:11:16.300 --> 00:11:16.460
You can,

00:11:16.610 --> 00:11:18.890
you have this folder called Apps and you also have

00:11:18.890 --> 00:11:19.810
a data ops.

00:11:19.980 --> 00:11:22.110
this is because we're working in a mono repo and

00:11:22.110 --> 00:11:22.790
the reason we're

00:11:23.670 --> 00:11:25.710
working in a monorepo is because we need to

00:11:25.710 --> 00:11:26.230
segment

00:11:26.550 --> 00:11:29.430
the user facing stuff with the deeper backend

00:11:29.430 --> 00:11:29.820
stuff.

00:11:29.820 --> 00:11:31.210
and all of these things are going to be hosted on

00:11:31.210 --> 00:11:32.890
cloudflare but they're going to have different

00:11:32.890 --> 00:11:33.650
responsibilities

00:11:33.805 --> 00:11:35.894
now just the TLDR of a monorepo.

00:11:35.894 --> 00:11:37.174
So essentially you can have

00:11:37.494 --> 00:11:38.534
inside of apps,

00:11:38.534 --> 00:11:40.814
you can have like your Next JS app or your React

00:11:40.814 --> 00:11:41.654
app or your

00:11:42.164 --> 00:11:43.084
backend application.

00:11:43.084 --> 00:11:44.764
And in this situation we have our User

00:11:44.764 --> 00:11:45.204
application,

00:11:45.204 --> 00:11:47.764
which is this UI that you saw right here.

00:11:48.244 --> 00:11:49.684
And then it is also

00:11:50.514 --> 00:11:51.834
the TRPC backend.

00:11:51.834 --> 00:11:53.074
So like a really lightweight

00:11:53.304 --> 00:11:55.304
backend that interfaces with the database.

00:11:55.544 --> 00:11:57.503
And then we have another service that is

00:11:57.503 --> 00:11:59.584
responsible for like all of the deeper data

00:11:59.584 --> 00:12:00.144
operations.

00:12:00.144 --> 00:12:01.904
So there's kind of two services being deployed.

00:12:01.904 --> 00:12:03.984
But if your SaaS application grows and grows and

00:12:03.984 --> 00:12:04.224
grows,

00:12:04.224 --> 00:12:06.544
you can kind of segment responsibility based upon

00:12:06.544 --> 00:12:08.384
services inside of this apps folder.

00:12:08.384 --> 00:12:11.064
And then we have a Data Ops package which

00:12:11.394 --> 00:12:14.484
is basically a way of taking our TypeScript code

00:12:14.564 --> 00:12:16.804
that we want to share across all of our different

00:12:16.804 --> 00:12:18.164
apps or some of our apps,

00:12:18.564 --> 00:12:19.604
generalizing it,

00:12:19.604 --> 00:12:22.484
packaging it and then being able to use it inside

00:12:22.484 --> 00:12:23.604
of these applications.

00:12:24.384 --> 00:12:25.904
so enough about this,

00:12:26.224 --> 00:12:28.104
I just want to kind of like go over the

00:12:28.104 --> 00:12:29.584
responsibilities of these services now.

00:12:29.584 --> 00:12:31.384
I do think this is a very important section so I

00:12:31.384 --> 00:12:31.824
wouldn't like,

00:12:31.824 --> 00:12:34.224
I wouldn't skip to where we get into the code.

00:12:34.224 --> 00:12:36.104
I want to drill in the point of like the

00:12:36.104 --> 00:12:37.264
responsibility of services.

00:12:37.988 --> 00:12:38.988
So like we just mentioned,

00:12:38.988 --> 00:12:41.708
we have two services and we have a Data Ops

00:12:41.708 --> 00:12:42.148
package.

00:12:42.228 --> 00:12:45.108
So this is a monorepo setup and we're using PMPM

00:12:45.188 --> 00:12:46.788
to a POPM workspace.

00:12:46.788 --> 00:12:48.108
Not just a little bit different than just like

00:12:48.108 --> 00:12:48.908
PNPM install.

00:12:48.908 --> 00:12:51.428
It's a workspace where we're able to basically say

00:12:51.428 --> 00:12:52.708
at the root level of our project

00:12:53.028 --> 00:12:55.228
we're able to specify what our services and what

00:12:55.228 --> 00:12:55.948
our package is.

00:12:55.948 --> 00:12:56.308
Now

00:12:56.768 --> 00:12:57.608
if you're,

00:12:57.608 --> 00:12:59.848
if you've built stuff before using Next JS but you

00:12:59.848 --> 00:13:01.968
haven't like built out a dedicated backend,

00:13:02.298 --> 00:13:04.018
this setup is going to be a little bit new to you.

00:13:04.018 --> 00:13:05.658
But that's okay because I actually think you're

00:13:05.658 --> 00:13:06.498
going to like it more.

00:13:06.498 --> 00:13:08.528
So what we're doing here is we

00:13:08.598 --> 00:13:11.158
have a user application and this user application

00:13:11.158 --> 00:13:12.838
is going to be using some technologies that we're

00:13:12.838 --> 00:13:13.368
familiar with.

00:13:13.368 --> 00:13:13.798
react,

00:13:14.028 --> 00:13:16.258
Tanstack using Tanstack Query and Router,

00:13:16.338 --> 00:13:17.857
using shadcn for styling,

00:13:18.178 --> 00:13:20.658
TRPC for having like type safe interactions

00:13:20.658 --> 00:13:22.818
between the front end and the back end and then

00:13:22.818 --> 00:13:25.178
HONO for some like API routing and whatnot as

00:13:25.178 --> 00:13:25.378
well.

00:13:25.378 --> 00:13:25.698
So

00:13:25.938 --> 00:13:26.938
is the tech but what

00:13:27.198 --> 00:13:28.558
we really want to focus on are what are the

00:13:28.558 --> 00:13:29.118
responsibilities.

00:13:29.198 --> 00:13:31.718
So in my opinion the responsibilities of the user

00:13:31.718 --> 00:13:34.638
facing application should literally be routing,

00:13:35.118 --> 00:13:36.798
auth and CRUD operations.

00:13:36.878 --> 00:13:37.598
It should be very,

00:13:37.598 --> 00:13:38.158
very simple.

00:13:38.158 --> 00:13:40.758
You shouldn't bake in lots and lots of like data

00:13:40.758 --> 00:13:43.478
operations and long running tasks inside of your

00:13:43.478 --> 00:13:44.478
full stack framework.

00:13:44.478 --> 00:13:46.918
I think that a dedicated data service is the best

00:13:46.918 --> 00:13:47.918
way to scale a project,

00:13:48.098 --> 00:13:50.178
by Basically splitting up those responsibilities.

00:13:50.258 --> 00:13:52.898
So in our data service we're going to have similar

00:13:52.898 --> 00:13:55.458
technology like it's Hono is going to be used in

00:13:55.938 --> 00:13:56.898
both of these applications

00:13:57.008 --> 00:13:58.288
and we're going to be using

00:13:58.408 --> 00:13:59.768
Cloudflare queues for

00:14:00.088 --> 00:14:00.648
basically

00:14:00.968 --> 00:14:01.608
getting data,

00:14:01.608 --> 00:14:03.448
putting it on a queue and then kind of processing

00:14:03.448 --> 00:14:04.408
it later into the future.

00:14:04.728 --> 00:14:06.088
Durable objects for

00:14:06.098 --> 00:14:07.088
managing scheduling,

00:14:07.088 --> 00:14:08.568
also managing websockets

00:14:08.888 --> 00:14:09.767
workflows,

00:14:09.798 --> 00:14:12.508
for running sequential jobs like jobs that require

00:14:12.508 --> 00:14:14.628
multiple steps and having some like

00:14:15.148 --> 00:14:16.578
guarantees with each step.

00:14:18.376 --> 00:14:19.896
we're going to be using browser rendering.

00:14:19.896 --> 00:14:21.536
On the back end we're going to be using

00:14:21.536 --> 00:14:24.376
Cloudflare's built in AI offering for AI inference

00:14:24.376 --> 00:14:25.856
and then we're also going to have web sockets.

00:14:25.856 --> 00:14:27.216
But the most important thing here is the

00:14:27.216 --> 00:14:27.736
responsibility.

00:14:27.736 --> 00:14:29.576
So the responsibilities of the backend service is

00:14:29.816 --> 00:14:30.776
data processing

00:14:31.256 --> 00:14:34.016
long running tasks and our link redirect.

00:14:34.016 --> 00:14:36.016
So the link redirect component of actually routing

00:14:36.016 --> 00:14:37.896
the user to the right spot are going to be

00:14:37.896 --> 00:14:39.496
responsible by the data service.

00:14:39.576 --> 00:14:41.416
And on the back end side of things

00:14:41.756 --> 00:14:43.596
we're going to be using or on the data ops side of

00:14:43.596 --> 00:14:44.876
things we're going to be using Drizzle

00:14:45.386 --> 00:14:45.626
for

00:14:45.826 --> 00:14:47.366
having like type safe

00:14:47.526 --> 00:14:48.726
interactions with our database.

00:14:49.046 --> 00:14:51.046
We're going to be using ZOD for having

00:14:51.526 --> 00:14:52.966
secure types in our

00:14:53.006 --> 00:14:55.866
throughout our code base and then PNPM workspace

00:14:55.866 --> 00:14:58.186
to kind of package the code so we can share it

00:14:58.186 --> 00:14:59.066
across our services.

00:14:59.226 --> 00:15:02.266
Now the responsibilities of data auth are our data

00:15:02.266 --> 00:15:03.546
ops are schema management,

00:15:04.066 --> 00:15:04.726
our database,

00:15:04.726 --> 00:15:05.766
our database queries.

00:15:05.846 --> 00:15:08.286
So we're going to be writing out like actual

00:15:08.286 --> 00:15:08.806
queries

00:15:09.696 --> 00:15:10.376
under functions.

00:15:10.376 --> 00:15:12.016
We're going to be exporting those functions so we

00:15:12.016 --> 00:15:14.776
could use them in both user applications and the

00:15:14.776 --> 00:15:15.376
data service.

00:15:16.026 --> 00:15:18.346
it's going to be responsible for like our types

00:15:18.346 --> 00:15:19.706
and our ZOD schemas.

00:15:19.866 --> 00:15:22.146
And then the main focus is this is where our

00:15:22.146 --> 00:15:23.464
reusable code goes.

00:15:23.464 --> 00:15:25.764
So with that being said let's just look at how

00:15:25.764 --> 00:15:27.524
like a normal data flow would go.

00:15:27.524 --> 00:15:27.924
So

00:15:28.114 --> 00:15:30.924
if the user loads our web page it's going to go to

00:15:30.924 --> 00:15:32.564
our user application and

00:15:33.064 --> 00:15:35.144
a lot of these like client components

00:15:35.214 --> 00:15:36.564
are rendered into the,

00:15:36.564 --> 00:15:38.564
are loaded into the browser.

00:15:38.724 --> 00:15:41.644
The UI loads and then some data is fetched to our

00:15:41.644 --> 00:15:42.604
TRPC backend.

00:15:42.604 --> 00:15:45.164
So the user application actually consists of a

00:15:45.164 --> 00:15:46.604
front end and a back end.

00:15:46.604 --> 00:15:47.444
There's both here,

00:15:47.514 --> 00:15:49.724
and then the layer in between is we're going to

00:15:49.724 --> 00:15:50.124
have auth.

00:15:50.284 --> 00:15:53.044
So it's very isolated in the responsibilities

00:15:53.044 --> 00:15:53.374
here.

00:15:53.374 --> 00:15:54.974
basically we're saying the requests that are going

00:15:54.974 --> 00:15:56.854
to the backend we're going to build out auth,

00:15:56.934 --> 00:15:58.854
so this layer can secure,

00:15:59.094 --> 00:16:00.974
can ensure that users can only see what they're

00:16:00.974 --> 00:16:01.574
supposed to see.

00:16:02.014 --> 00:16:03.254
Now from there our,

00:16:03.254 --> 00:16:05.734
our TRPC routes or backend inside of our user

00:16:05.734 --> 00:16:08.014
application are going to do basic crud operations.

00:16:08.014 --> 00:16:09.134
Managing the

00:16:09.284 --> 00:16:10.014
creation of links,

00:16:10.014 --> 00:16:10.734
updating the links,

00:16:10.734 --> 00:16:11.454
deleting the links,

00:16:11.454 --> 00:16:13.094
seeing all of the analytics and whatnot.

00:16:13.094 --> 00:16:14.854
So that's the interactions that it has with the

00:16:14.854 --> 00:16:15.214
database.

00:16:15.214 --> 00:16:16.454
And then in some situations,

00:16:16.454 --> 00:16:17.493
like with WebSockets,

00:16:17.734 --> 00:16:20.334
it'll be responsible for validating the request

00:16:20.334 --> 00:16:23.334
and then proxying the request to our data service.

00:16:23.494 --> 00:16:24.854
Now our data service

00:16:25.174 --> 00:16:26.134
is going to have

00:16:26.844 --> 00:16:28.364
these different compute primitives,

00:16:28.684 --> 00:16:29.964
but it's going to

00:16:30.444 --> 00:16:32.844
be triggered by specific cloudflare trigger.

00:16:32.844 --> 00:16:35.204
So like a trigger would be an API request,

00:16:35.204 --> 00:16:37.244
an API request to our backend service,

00:16:37.404 --> 00:16:38.724
maybe a cron schedule,

00:16:38.724 --> 00:16:41.564
like some type of cron job that says every five

00:16:41.564 --> 00:16:43.324
hours wake up the code and run something,

00:16:43.504 --> 00:16:44.364
and then a queue event.

00:16:44.444 --> 00:16:45.964
So when data is on a queue,

00:16:46.124 --> 00:16:48.644
you can have a dedicated service that is listening

00:16:48.644 --> 00:16:50.884
to that queue and then processing the data there.

00:16:50.884 --> 00:16:52.364
And then all of these

00:16:52.524 --> 00:16:54.244
triggers are going to interface with different

00:16:54.244 --> 00:16:56.204
like resources and durable objects,

00:16:56.204 --> 00:16:56.604
workflows,

00:16:56.604 --> 00:16:56.884
queues.

00:16:56.884 --> 00:16:58.164
And then there's other things as well,

00:16:58.164 --> 00:16:58.484
like

00:16:58.704 --> 00:17:00.464
AI browser rendering and whatnot.

00:17:00.464 --> 00:17:02.264
So this is kind of like how the data flow goes.

00:17:02.264 --> 00:17:02.664
You can,

00:17:02.664 --> 00:17:03.944
you can basically say like,

00:17:03.944 --> 00:17:06.024
is this operation something that should be pushed

00:17:06.024 --> 00:17:07.664
to the back end because it's like some type of

00:17:07.664 --> 00:17:08.384
data operation?

00:17:08.384 --> 00:17:10.984
Or is this just like a user triggered,

00:17:11.004 --> 00:17:12.444
is this like a user triggered

00:17:12.844 --> 00:17:12.904
crud,

00:17:13.104 --> 00:17:15.304
operation that is going to live inside of the user

00:17:15.304 --> 00:17:15.904
application?

00:17:16.784 --> 00:17:18.144
So now before we get started,

00:17:18.224 --> 00:17:20.064
I pointed out this repo right here,

00:17:20.064 --> 00:17:21.104
which is our

00:17:21.664 --> 00:17:22.624
starter template.

00:17:22.954 --> 00:17:24.434
And essentially you're just going to go ahead and

00:17:24.434 --> 00:17:25.754
fork it and you'll,

00:17:25.754 --> 00:17:27.594
you can fork this code and you can like start

00:17:27.594 --> 00:17:28.554
building based upon

00:17:28.774 --> 00:17:30.094
the fork version of this code.

00:17:30.094 --> 00:17:31.334
The next video is going to talk about this,

00:17:31.334 --> 00:17:33.734
but if at any point in this video you get stuck or

00:17:33.734 --> 00:17:34.254
throughout this course,

00:17:34.254 --> 00:17:35.014
if you get stuck,

00:17:35.254 --> 00:17:37.094
I'm going to also link in this video.

00:17:37.254 --> 00:17:38.294
This repo right here,

00:17:38.294 --> 00:17:40.894
this is my starter repo that I forked and the

00:17:40.894 --> 00:17:42.334
exact code that I went through throughout the

00:17:42.334 --> 00:17:43.734
entire course to actually

00:17:44.574 --> 00:17:46.414
to actually like build things out.

00:17:46.414 --> 00:17:48.294
So this is in its final state,

00:17:48.294 --> 00:17:49.694
the application is fully built.

00:17:49.694 --> 00:17:50.814
So if you ever get stuck,

00:17:50.894 --> 00:17:52.774
you can just come over to the apps,

00:17:52.774 --> 00:17:53.054
you know,

00:17:53.054 --> 00:17:53.334
find,

00:17:53.334 --> 00:17:54.794
find the COD that you're working on.

00:17:54.874 --> 00:17:56.394
You can compare against mine and be like,

00:17:56.394 --> 00:17:56.594
oh,

00:17:56.594 --> 00:17:57.034
that's why,

00:17:57.114 --> 00:17:57.754
another thing,

00:17:57.754 --> 00:17:58.634
if you get stuck,

00:17:58.634 --> 00:18:01.074
I would really encourage you to be using like

00:18:01.074 --> 00:18:02.554
cloud code or cursor,

00:18:02.564 --> 00:18:04.524
agents just to basically chat with like,

00:18:04.524 --> 00:18:04.884
hey,

00:18:04.884 --> 00:18:06.004
I'm watching a course.

00:18:06.164 --> 00:18:06.764
I was,

00:18:06.764 --> 00:18:09.283
I got to this section and I'm having this issue

00:18:09.283 --> 00:18:11.484
and I can't figure out it's not covered in the

00:18:11.484 --> 00:18:11.764
course.

00:18:12.004 --> 00:18:12.404
Why,

00:18:12.644 --> 00:18:13.284
what's the case?

00:18:13.284 --> 00:18:14.044
And then see if like,

00:18:14.044 --> 00:18:15.084
your agent can also solve it.

00:18:15.084 --> 00:18:15.644
Because that's like,

00:18:15.644 --> 00:18:16.484
honestly such a great,

00:18:16.564 --> 00:18:18.284
a great use case where you can learn these

00:18:18.284 --> 00:18:19.004
concepts from like,

00:18:19.004 --> 00:18:19.844
seeing them in practice.

00:18:19.844 --> 00:18:20.764
But then when you get stuck,

00:18:20.764 --> 00:18:21.044
you know,

00:18:21.044 --> 00:18:21.404
you can like,

00:18:21.404 --> 00:18:23.124
ask those questions and get feedback about like,

00:18:23.124 --> 00:18:23.724
what you're coding.

00:18:23.724 --> 00:18:24.524
And maybe you have a typo,

00:18:24.524 --> 00:18:25.704
like maybe it's something simple as like,

00:18:25.704 --> 00:18:25.764
oh,

00:18:25.764 --> 00:18:27.078
I'm using the wrong type here or something.

00:18:27.078 --> 00:18:27.360
But yeah,

00:18:27.360 --> 00:18:27.520
that,

00:18:27.520 --> 00:18:28.280
that this is really important.

00:18:28.280 --> 00:18:28.920
So just like,

00:18:28.920 --> 00:18:29.440
keep in mind,

00:18:29.440 --> 00:18:30.280
if you ever get stuck,

00:18:30.280 --> 00:18:32.280
you can just reference this repo right here.

00:18:32.760 --> 00:18:34.800
Now the last thing that I want to mention is this

00:18:34.800 --> 00:18:35.160
course,

00:18:35.280 --> 00:18:37.200
is geared towards just kind of like having a bunch

00:18:37.200 --> 00:18:37.840
of sections.

00:18:37.840 --> 00:18:38.240
So,

00:18:38.339 --> 00:18:40.820
every single section builds upon itself and

00:18:41.400 --> 00:18:43.400
section contains a video where we talk about like,

00:18:43.400 --> 00:18:44.000
what we're building.

00:18:44.160 --> 00:18:44.920
You see the code,

00:18:44.920 --> 00:18:45.600
you see what I'm doing.

00:18:45.600 --> 00:18:47.920
I explain in detail everything that's going on.

00:18:48.160 --> 00:18:49.150
And then I,

00:18:49.160 --> 00:18:51.270
under most sections where there's actual like,

00:18:51.270 --> 00:18:52.150
code being done,

00:18:52.470 --> 00:18:53.430
I have like,

00:18:53.840 --> 00:18:54.370
the actual like,

00:18:54.370 --> 00:18:55.330
code that's being used.

00:18:55.330 --> 00:18:55.850
So there's,

00:18:55.850 --> 00:18:56.650
there's two things here.

00:18:56.650 --> 00:18:57.730
There's one at the top,

00:18:57.730 --> 00:18:57.970
right?

00:18:57.970 --> 00:18:59.490
You're going to see follow along,

00:18:59.490 --> 00:19:01.330
basically meaning watch the video,

00:19:01.730 --> 00:19:03.850
look at what I'm doing and try to mirror exactly

00:19:03.850 --> 00:19:04.370
what I'm doing.

00:19:04.370 --> 00:19:06.370
And then make sure you bring in the code,

00:19:06.660 --> 00:19:07.020
that,

00:19:07.020 --> 00:19:09.260
that I have actually like put into the code base.

00:19:09.260 --> 00:19:11.140
Bring that over to your own project because you're

00:19:11.140 --> 00:19:12.660
going to want to make sure you keep up to speed

00:19:12.660 --> 00:19:15.060
with the video so your project stays in the same

00:19:15.060 --> 00:19:16.020
state as my project.

00:19:17.388 --> 00:19:17.908
Now there are,

00:19:17.908 --> 00:19:19.068
there are some videos,

00:19:19.298 --> 00:19:21.138
like understanding the worker runtime,

00:19:21.138 --> 00:19:22.618
where they're more conceptual in nature,

00:19:22.618 --> 00:19:24.338
where I'm trying to convey a concept,

00:19:24.368 --> 00:19:26.238
and I'm going into great detail to just kind of

00:19:26.238 --> 00:19:28.318
like draw diagrams and go over things.

00:19:28.318 --> 00:19:29.797
You're going to notice it just says just watch.

00:19:29.797 --> 00:19:30.478
So sit back,

00:19:30.688 --> 00:19:32.238
think critically about what I'm saying.

00:19:32.238 --> 00:19:32.758
And then like,

00:19:32.758 --> 00:19:34.198
these are really going to help you if you,

00:19:34.198 --> 00:19:35.998
if you follow along with the code stuff.

00:19:35.998 --> 00:19:38.158
And then you also watch these lectures where I'm

00:19:38.158 --> 00:19:38.598
trying to like,

00:19:38.598 --> 00:19:39.438
convey a concept.

00:19:39.598 --> 00:19:41.638
You should have a really good understanding of

00:19:41.638 --> 00:19:43.878
Cloudflare and how to build systems by the end of

00:19:43.878 --> 00:19:44.318
this course.

00:19:44.382 --> 00:19:45.702
And then just the last thing,

00:19:45.702 --> 00:19:47.262
I just want to show an example of what this would

00:19:47.262 --> 00:19:47.662
look like.

00:19:47.662 --> 00:19:48.062
So,

00:19:48.212 --> 00:19:48.542
throughout,

00:19:48.542 --> 00:19:49.262
like this video,

00:19:49.582 --> 00:19:51.262
these are like some of the code snippets that

00:19:51.262 --> 00:19:52.382
we're going to bring into our code.

00:19:52.382 --> 00:19:54.702
So this is one where we are creating these tables

00:19:54.702 --> 00:19:55.452
in our database.

00:19:55.452 --> 00:19:55.942
and you're like,

00:19:55.942 --> 00:19:56.102
well,

00:19:56.102 --> 00:19:58.341
I don't want to type out line by line all of these

00:19:58.341 --> 00:19:58.542
things.

00:19:58.542 --> 00:19:59.182
That's fine.

00:19:59.182 --> 00:20:00.942
Whenever it's a scenario like this,

00:20:01.022 --> 00:20:03.502
I always put the code snippets in the inside of

00:20:03.502 --> 00:20:03.752
the,

00:20:03.752 --> 00:20:04.602
learning material,

00:20:04.682 --> 00:20:06.922
so you could just copy it over and then move it to

00:20:06.922 --> 00:20:07.882
wherever it needs to be.

00:20:07.882 --> 00:20:08.282
So

00:20:08.772 --> 00:20:10.352
I think that's enough of rambling here.

00:20:10.942 --> 00:20:12.822
at this point I think that we can dive into the

00:20:12.822 --> 00:20:13.982
code and we can really get started.

00:20:14.142 --> 00:20:14.856
So let's do it.

