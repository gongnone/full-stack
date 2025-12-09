WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.119 --> 00:00:01.359
So before we use queues,

00:00:01.359 --> 00:00:03.639
we're going to have to upgrade our Cloudflare

00:00:03.639 --> 00:00:05.799
account from the free tier to the paid tier.

00:00:06.119 --> 00:00:08.159
Now essentially what this means is when you

00:00:08.159 --> 00:00:10.199
Upgrade to the $5 a month tier,

00:00:10.279 --> 00:00:11.879
you're unlocking a whole bunch of different,

00:00:12.109 --> 00:00:14.099
products and features that Cloudflare offers.

00:00:14.099 --> 00:00:15.739
So you'll unlock containers,

00:00:15.899 --> 00:00:18.819
you'll unlock all versions of durable objects.

00:00:18.819 --> 00:00:20.139
Workflows were already free.

00:00:20.619 --> 00:00:23.619
And then under the storage databases we're going

00:00:23.619 --> 00:00:24.469
to be unlocking key.

00:00:25.099 --> 00:00:25.739
So I've already

00:00:26.059 --> 00:00:26.459
actually

00:00:26.939 --> 00:00:29.459
upgraded this account to the pay tier just now for

00:00:29.459 --> 00:00:30.459
the purpose of this course.

00:00:30.459 --> 00:00:33.099
This is a course specific Cloudflare account.

00:00:33.259 --> 00:00:33.659
Now,

00:00:34.099 --> 00:00:35.259
the billing,

00:00:35.259 --> 00:00:36.779
I think some people find it confusing,

00:00:36.779 --> 00:00:38.299
I find it relatively straightforward,

00:00:38.299 --> 00:00:40.498
but we can walk through really quickly how to

00:00:40.579 --> 00:00:41.939
conceptualize the billing.

00:00:41.939 --> 00:00:42.339
So,

00:00:42.579 --> 00:00:43.759
a few notes right off the bat.

00:00:43.759 --> 00:00:46.479
This is $5 per account and you can add

00:00:46.799 --> 00:00:48.799
people to your account if you're collaborating

00:00:48.799 --> 00:00:50.479
with members of like your team.

00:00:50.479 --> 00:00:51.919
So if you're growing a team,

00:00:52.079 --> 00:00:53.519
you have different people working with you,

00:00:53.519 --> 00:00:55.239
you can actually add them to your course.

00:00:55.239 --> 00:00:55.599
You

00:00:55.979 --> 00:00:56.859
that under,

00:00:57.039 --> 00:00:58.648
you can do that under account management.

00:00:59.208 --> 00:01:00.568
You can add members to your team,

00:01:00.568 --> 00:01:01.488
you can give them permissions,

00:01:01.488 --> 00:01:03.408
you can say what resources they have access to and

00:01:03.408 --> 00:01:04.208
what they don't have access to.

00:01:04.208 --> 00:01:05.328
And when you add them to your account,

00:01:05.328 --> 00:01:07.128
you're not paying $5 per member.

00:01:07.128 --> 00:01:07.648
It just,

00:01:07.648 --> 00:01:09.048
you just are able to add them,

00:01:09.128 --> 00:01:09.848
which is great.

00:01:09.848 --> 00:01:12.048
If you look at a lot of other SaaS platforms and

00:01:12.048 --> 00:01:12.928
compute platforms,

00:01:12.928 --> 00:01:16.088
they basically charge $25 or $20 or $15 every

00:01:16.088 --> 00:01:17.488
single person you add to your account,

00:01:17.488 --> 00:01:19.928
which I just don't really love that model.

00:01:20.948 --> 00:01:21.508
part of this,

00:01:21.508 --> 00:01:23.828
you can deploy up to 500 applications.

00:01:23.988 --> 00:01:26.988
So you can have 500 worker applications on your

00:01:26.988 --> 00:01:27.788
Cloudflare account,

00:01:27.788 --> 00:01:28.142
which

00:01:28.142 --> 00:01:28.728
is a lot.

00:01:28.788 --> 00:01:30.078
if you're doing more than that,

00:01:30.078 --> 00:01:31.078
they have other plans.

00:01:31.078 --> 00:01:33.078
They have this like workers for platforms which

00:01:33.078 --> 00:01:33.678
allow you,

00:01:33.678 --> 00:01:35.518
this give you like more flexibility around

00:01:36.178 --> 00:01:36.538
having

00:01:36.750 --> 00:01:38.275
being able to like programmatically deploy

00:01:38.275 --> 00:01:38.795
applications,

00:01:38.795 --> 00:01:39.395
easier

00:01:39.795 --> 00:01:41.555
manage bindings in a dynamic way.

00:01:41.555 --> 00:01:43.535
But that's far beyond the scope of this course,

00:01:43.775 --> 00:01:43.935
course.

00:01:43.935 --> 00:01:44.895
But 500

00:01:45.455 --> 00:01:47.855
applications or 500 worker applications on a

00:01:47.855 --> 00:01:48.335
single account,

00:01:48.335 --> 00:01:48.695
Like,

00:01:48.695 --> 00:01:50.935
I think it'd be very hard to build that many

00:01:50.935 --> 00:01:52.055
things to hit that limit.

00:01:52.055 --> 00:01:53.375
So that's one great thing.

00:01:53.565 --> 00:01:56.165
and then the other thing is just this usage based

00:01:56.165 --> 00:01:56.585
limit,

00:01:56.585 --> 00:01:57.625
usage based pricing.

00:01:57.625 --> 00:01:58.025
So

00:01:58.665 --> 00:01:59.785
part of the standard plan,

00:01:59.785 --> 00:02:00.585
$5 a month,

00:02:00.585 --> 00:02:02.945
you get 10 million requests a month and then each

00:02:02.945 --> 00:02:03.865
additional million

00:02:04.185 --> 00:02:05.705
requests is 30 cents.

00:02:05.705 --> 00:02:06.345
This is very,

00:02:06.345 --> 00:02:06.785
very cheap.

00:02:06.785 --> 00:02:09.345
If you Compare this to Vercel or Netlify or

00:02:09.345 --> 00:02:09.785
Convex.

00:02:09.785 --> 00:02:10.425
This is much,

00:02:10.585 --> 00:02:10.635
much

00:02:10.765 --> 00:02:11.125
cheaper.

00:02:11.125 --> 00:02:12.965
So you're getting a lot of bang for your buck for

00:02:12.965 --> 00:02:13.725
that five bucks.

00:02:14.175 --> 00:02:16.455
And then they just have like different ways of

00:02:16.455 --> 00:02:19.135
billing based upon CPU time versus like the full

00:02:19.135 --> 00:02:20.255
duration of the request.

00:02:20.415 --> 00:02:22.095
And if you like read through,

00:02:22.095 --> 00:02:24.015
they kind of have like these breakdowns of

00:02:24.545 --> 00:02:26.865
if you have an example of where you're getting

00:02:26.865 --> 00:02:28.785
like 30 million requests and you have a certain

00:02:28.785 --> 00:02:29.265
number of

00:02:29.585 --> 00:02:30.305
compute time,

00:02:30.305 --> 00:02:32.305
they basically kind of give you these examples of

00:02:32.305 --> 00:02:34.385
how much you're going to expect to be billed at

00:02:34.385 --> 00:02:35.025
the end of the month.

00:02:35.105 --> 00:02:35.505
Now

00:02:36.095 --> 00:02:38.615
what I found while I've been building for

00:02:38.615 --> 00:02:39.775
different clients is

00:02:40.275 --> 00:02:40.595
you know,

00:02:40.595 --> 00:02:42.555
you might have a hard time sussing out exactly how

00:02:42.555 --> 00:02:43.795
much a service is going to cost.

00:02:43.795 --> 00:02:45.475
Like maybe you know roughly how many requests

00:02:45.475 --> 00:02:45.955
you're going to get,

00:02:45.955 --> 00:02:46.475
but it's like,

00:02:46.475 --> 00:02:46.635
well,

00:02:46.635 --> 00:02:48.995
how much CPU time is every request going to take

00:02:48.995 --> 00:02:49.595
on average?

00:02:49.595 --> 00:02:50.355
How can I

00:02:50.605 --> 00:02:52.115
create like a good mental model for that?

00:02:52.115 --> 00:02:54.795
What I've noticed is the vast majority of projects

00:02:54.795 --> 00:02:57.515
that I've worked on for customers seldomly go past

00:02:57.515 --> 00:02:58.635
that $5 a month.

00:02:58.635 --> 00:02:59.155
Just because

00:02:59.555 --> 00:03:01.395
for a lot of like midsize businesses,

00:03:01.395 --> 00:03:03.875
10 million requests is a lot to handle in a month.

00:03:03.875 --> 00:03:04.715
Now it's not crazy,

00:03:04.715 --> 00:03:05.835
it's not like crazy numbers.

00:03:05.835 --> 00:03:07.235
But what I've noticed is

00:03:07.995 --> 00:03:10.035
during the development process and launching and

00:03:10.035 --> 00:03:10.875
beta testing,

00:03:11.035 --> 00:03:13.675
we never really exceed that $5 a month tier.

00:03:13.675 --> 00:03:15.915
So we're able to get a really good gauge as to

00:03:16.365 --> 00:03:18.115
what functions are having like,

00:03:18.355 --> 00:03:21.275
or what workers are having higher average CPU

00:03:21.275 --> 00:03:21.635
time,

00:03:21.835 --> 00:03:23.635
which workers are getting the most requests.

00:03:23.635 --> 00:03:26.755
And before we even like break into this usage

00:03:26.755 --> 00:03:27.515
based billing,

00:03:27.515 --> 00:03:30.235
we're able to get a good mental model as to once

00:03:30.235 --> 00:03:32.395
we scale to a certain number of users or a certain

00:03:32.395 --> 00:03:33.315
amount of revenue,

00:03:33.315 --> 00:03:35.515
how much this pricing is going to be based upon

00:03:35.515 --> 00:03:35.795
like

00:03:36.195 --> 00:03:37.115
historical usage.

00:03:37.115 --> 00:03:39.355
So I wouldn't be super concerned about trying to

00:03:39.355 --> 00:03:41.995
like project how much you theoretically are going

00:03:41.995 --> 00:03:42.755
to pay one day.

00:03:42.755 --> 00:03:44.435
I would say build this stuff,

00:03:44.435 --> 00:03:45.595
know that it's going to scale,

00:03:45.595 --> 00:03:47.275
know that it's going to be cheaper than really any

00:03:47.275 --> 00:03:48.795
of the other serverless providers.

00:03:48.795 --> 00:03:49.315
And then

00:03:50.165 --> 00:03:52.244
after doing that for a few weeks and actually

00:03:52.244 --> 00:03:53.685
getting users and seeing usage,

00:03:53.685 --> 00:03:55.285
you'll be able to kind of build that mental model

00:03:55.285 --> 00:03:57.845
out and have like an accurate pricing of like your

00:03:57.845 --> 00:03:59.285
theoretical number for scale.

00:03:59.285 --> 00:03:59.685
So

00:03:59.885 --> 00:04:01.045
now that's if you're like,

00:04:01.045 --> 00:04:01.565
you know,

00:04:01.565 --> 00:04:02.205
starting out,

00:04:02.205 --> 00:04:04.285
you don't have like an existing company,

00:04:04.445 --> 00:04:06.245
you don't really know how many users you're going

00:04:06.245 --> 00:04:06.485
to have.

00:04:06.485 --> 00:04:06.965
If you have,

00:04:06.965 --> 00:04:07.245
like,

00:04:07.605 --> 00:04:07.765
very,

00:04:07.765 --> 00:04:08.985
very specific number of,

00:04:08.985 --> 00:04:10.585
users that you know you're going to have,

00:04:10.825 --> 00:04:11.225
and

00:04:11.625 --> 00:04:13.385
you know you're going to be making money doing

00:04:13.385 --> 00:04:14.105
high volume,

00:04:14.105 --> 00:04:14.945
you should probably,

00:04:14.945 --> 00:04:15.385
you know,

00:04:15.385 --> 00:04:16.145
run the math and,

00:04:16.145 --> 00:04:16.305
like,

00:04:16.305 --> 00:04:17.625
kind of project what it's going to be.

00:04:17.625 --> 00:04:19.945
But there's a very small percentage of

00:04:20.505 --> 00:04:22.185
people and services that

00:04:22.665 --> 00:04:23.065
actually,

00:04:23.305 --> 00:04:23.705
like,

00:04:24.345 --> 00:04:27.465
hit a meaningful amount of volume to really even

00:04:27.465 --> 00:04:28.985
be concerned about the price here.

00:04:29.065 --> 00:04:30.665
So just to keep that in mind,

00:04:30.665 --> 00:04:31.185
when you're.

00:04:31.185 --> 00:04:32.465
You're thinking about billing.

00:04:32.465 --> 00:04:33.545
So this point,

00:04:33.545 --> 00:04:35.625
make sure you upgrade to this $5 a month plan.

00:04:35.625 --> 00:04:36.345
And then from there,

00:04:36.345 --> 00:04:38.065
what you're going to notice is if you head over to

00:04:38.065 --> 00:04:38.585
the que,

00:04:39.115 --> 00:04:40.315
it's going to basically say,

00:04:40.315 --> 00:04:40.955
create a queue.

00:04:40.955 --> 00:04:42.275
If you're on the free tier,

00:04:42.275 --> 00:04:43.875
this is going to say you need to upgrade in order

00:04:43.875 --> 00:04:44.606
to create a queue.

