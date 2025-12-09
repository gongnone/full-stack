WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.018 --> 00:00:02.298
Now before we move into durable objects,

00:00:02.298 --> 00:00:05.018
we're going to want to wire the evaluation data

00:00:05.018 --> 00:00:07.978
that we are saving into our user application.

00:00:07.978 --> 00:00:10.018
So the UI component of our project.

00:00:10.418 --> 00:00:13.058
So let's just CD over to our user application

00:00:13.218 --> 00:00:13.898
pnpm,

00:00:13.898 --> 00:00:14.498
run dev,

00:00:14.578 --> 00:00:16.498
boot this guy up and I'll show you exactly what I

00:00:16.498 --> 00:00:16.978
mean here.

00:00:16.978 --> 00:00:18.658
So this guy gets running.

00:00:18.658 --> 00:00:20.338
Let's head over to our dashboard and what we're

00:00:20.338 --> 00:00:23.378
going to notice here is that there are kind of two

00:00:23.378 --> 00:00:25.138
sections that are utilizing the

00:00:26.108 --> 00:00:26.828
evaluation

00:00:27.618 --> 00:00:29.818
the evaluation methods that we've defined inside

00:00:29.818 --> 00:00:30.938
of our data ops.

00:00:30.938 --> 00:00:34.258
So instead of our data ops package we have this

00:00:34.258 --> 00:00:34.658
query,

00:00:34.908 --> 00:00:37.378
we have these queries for evaluations and we had

00:00:37.378 --> 00:00:39.698
this like add evaluation that is being added from

00:00:39.698 --> 00:00:40.338
our queue.

00:00:40.578 --> 00:00:42.098
But we also added a

00:00:43.148 --> 00:00:45.348
get not available evaluations and then get

00:00:45.348 --> 00:00:46.068
evaluations.

00:00:46.068 --> 00:00:47.948
This kind of just returns like the Most

00:00:47.978 --> 00:00:50.868
recent 25 evaluations and then also allows us to

00:00:51.108 --> 00:00:51.838
fill filter

00:00:52.058 --> 00:00:53.598
by like a created before date.

00:00:53.678 --> 00:00:56.718
So what we're going to want to do here is

00:00:57.278 --> 00:00:57.298
kind

00:00:57.418 --> 00:00:59.338
of identify exactly where we're going to be

00:00:59.338 --> 00:00:59.778
updating.

00:00:59.858 --> 00:01:02.058
So we have the section with problematic links

00:01:02.058 --> 00:01:03.658
right now this is just kind of hard coded stuff.

00:01:03.658 --> 00:01:06.498
And then we also have this evaluations

00:01:07.218 --> 00:01:07.258
dashboard

00:01:07.718 --> 00:01:08.638
here which,

00:01:08.638 --> 00:01:09.858
or this evaluations

00:01:09.988 --> 00:01:11.988
section in the dashboard which just is going to

00:01:11.988 --> 00:01:13.108
allow like for pagination.

00:01:13.108 --> 00:01:15.028
Every single time evaluations run they'll show up

00:01:15.028 --> 00:01:15.188
here.

00:01:15.188 --> 00:01:16.588
We can kind of like inspect them.

00:01:16.588 --> 00:01:18.868
So if we head over to our user application,

00:01:19.248 --> 00:01:20.128
inside of

00:01:20.798 --> 00:01:23.798
the worker TRPC routes we have our evaluations

00:01:23.798 --> 00:01:24.038
route.

00:01:24.038 --> 00:01:26.038
And I know it's been a while in the course since

00:01:26.038 --> 00:01:27.158
we've actually worked on the ui,

00:01:27.158 --> 00:01:29.238
but this is kind of a section where we can

00:01:29.238 --> 00:01:31.158
actually start wiring the data that the backend is

00:01:31.158 --> 00:01:32.438
generating into the ui.

00:01:32.438 --> 00:01:32.798
So

00:01:32.908 --> 00:01:34.678
right now this is just returning dummy data.

00:01:34.678 --> 00:01:36.878
So there's this problematic destinations

00:01:37.458 --> 00:01:38.738
route which is

00:01:38.828 --> 00:01:40.788
returning this dummy data that looks like this

00:01:41.648 --> 00:01:44.128
kind of an array of like the evaluation

00:01:44.128 --> 00:01:44.488
information.

00:01:44.808 --> 00:01:48.008
So what we can do is we can import both of the

00:01:48.328 --> 00:01:49.528
methods that we have

00:01:49.888 --> 00:01:51.648
or both of the queries that we've defined

00:01:51.838 --> 00:01:52.768
inside of our

00:01:53.248 --> 00:01:54.448
data ops package.

00:01:54.448 --> 00:01:55.728
So I'm just going to go ahead and do that here.

00:01:55.728 --> 00:01:56.768
I'm going to delete this

00:01:57.006 --> 00:01:57.406
and

00:01:58.916 --> 00:02:02.716
from here we can basically say let's do get not

00:02:02.716 --> 00:02:03.076
available

00:02:03.666 --> 00:02:05.256
evaluations because that's what this query does.

00:02:05.256 --> 00:02:06.456
It basically just looks for

00:02:07.026 --> 00:02:08.916
evaluations that were tagged as not available.

00:02:09.076 --> 00:02:09.476
And

00:02:10.036 --> 00:02:11.156
we can call it,

00:02:11.156 --> 00:02:12.996
it looks like it's going to take some information

00:02:13.076 --> 00:02:13.436
here.

00:02:13.436 --> 00:02:16.146
So it takes an account ID which we,

00:02:16.296 --> 00:02:18.296
we can simply get from our context.

00:02:18.536 --> 00:02:19.656
So this is the context

00:02:20.316 --> 00:02:23.516
that we're defining in trpc and we have a

00:02:23.996 --> 00:02:26.076
user info and we have a user id.

00:02:26.076 --> 00:02:28.076
Right now we're just using user ID for that

00:02:28.076 --> 00:02:28.436
filter.

00:02:28.436 --> 00:02:30.316
That's kind of what we're using as a proxy for

00:02:30.316 --> 00:02:30.956
account id.

00:02:31.676 --> 00:02:32.075
And

00:02:32.396 --> 00:02:35.516
we come over here and we should notice that in our

00:02:35.516 --> 00:02:36.236
dashboard

00:02:36.306 --> 00:02:38.782
this takes a little bit to load just because we

00:02:38.782 --> 00:02:39.472
are using the

00:02:40.482 --> 00:02:42.002
the proxy to D1.

00:02:42.002 --> 00:02:43.762
So we're using the experimental feature.

00:02:44.162 --> 00:02:46.882
I do expect it to load a bit faster than this

00:02:46.882 --> 00:02:47.090
though.

00:02:47.627 --> 00:02:49.587
So this actually wasn't loading because I wasn't

00:02:49.587 --> 00:02:50.867
logged into my Cloudflare account.

00:02:50.867 --> 00:02:53.187
But now that I logged in we can see that this

00:02:53.187 --> 00:02:53.947
loads and

00:02:54.347 --> 00:02:56.347
we don't have any problematic links in here.

00:02:56.347 --> 00:02:59.227
That is just because our evaluations haven't

00:02:59.647 --> 00:03:01.047
tagged anything as a problematic link.

00:03:01.047 --> 00:03:04.047
So the second in evaluation runs where the product

00:03:04.047 --> 00:03:05.647
is like tagged as

00:03:05.767 --> 00:03:06.827
item not found or something.

00:03:06.827 --> 00:03:09.067
It's going to show up into here and we're also

00:03:09.067 --> 00:03:10.747
going to head over to evaluations because we have

00:03:10.747 --> 00:03:13.187
some dummy data here and we're just going to

00:03:13.187 --> 00:03:16.587
simply replace this dummy data that is right here.

00:03:16.907 --> 00:03:19.907
We're going to grab our context and it looks like

00:03:19.907 --> 00:03:21.147
this method is taking

00:03:21.877 --> 00:03:23.917
the account id so we can basically say

00:03:23.917 --> 00:03:27.267
ctx.user.user id

00:03:28.034 --> 00:03:28.434
and

00:03:28.786 --> 00:03:31.512
we will make sure we just await that method

00:03:31.512 --> 00:03:32.192
obviously.

00:03:32.314 --> 00:03:33.194
same for this one.

00:03:33.194 --> 00:03:35.354
It looks like I wasn't awaiting that as well.

00:03:35.434 --> 00:03:35.675
So.

00:03:35.675 --> 00:03:36.062
All right,

00:03:36.062 --> 00:03:37.662
so no evaluations found

00:03:37.844 --> 00:03:38.146
that.

00:03:38.360 --> 00:03:40.760
And the reason no evaluations are no,

00:03:40.910 --> 00:03:42.510
not found here is because

00:03:42.910 --> 00:03:45.270
if we head over to our Cloudflare dashboard is

00:03:45.270 --> 00:03:46.199
kind of want to like,

00:03:46.199 --> 00:03:46.378
just.

00:03:46.378 --> 00:03:48.298
So I just want to show you this just so you're not

00:03:48.298 --> 00:03:48.458
like,

00:03:48.458 --> 00:03:48.658
hey,

00:03:48.658 --> 00:03:49.698
this isn't working as expected.

00:03:49.778 --> 00:03:51.458
So basically what's happening is

00:03:51.778 --> 00:03:53.858
we have kind of hard coded a

00:03:54.098 --> 00:03:55.298
in our SQL database.

00:03:55.298 --> 00:03:57.218
We've hard coded a account ID

00:03:57.778 --> 00:04:00.058
that is not the one that is hard coded in our

00:04:00.058 --> 00:04:00.698
project right now.

00:04:00.698 --> 00:04:01.680
So this is just kind of like

00:04:01.680 --> 00:04:02.772
the things that you're going to go through during

00:04:02.772 --> 00:04:04.252
development just to kind of make things work.

00:04:04.252 --> 00:04:05.612
But we can say select

00:04:06.252 --> 00:04:07.212
star from

00:04:07.872 --> 00:04:09.311
destination evaluations

00:04:09.518 --> 00:04:12.069
and from here we can see that this is the account

00:04:12.069 --> 00:04:14.589
ID that we are using test account id.

00:04:14.853 --> 00:04:16.693
and that is not what is hard coded in our project

00:04:16.693 --> 00:04:17.453
for user id.

00:04:17.453 --> 00:04:18.773
But later we're not going to worry about this

00:04:18.773 --> 00:04:20.253
because we're going to build out auth and we're

00:04:20.253 --> 00:04:21.893
going to actually be able to pull those account

00:04:21.893 --> 00:04:23.613
IDs based upon the user.

00:04:23.613 --> 00:04:24.013
So,

00:04:24.273 --> 00:04:25.113
we reload this guy.

00:04:25.113 --> 00:04:27.200
We should see a few evaluations into here.

00:04:27.208 --> 00:04:27.448
All right.

00:04:27.448 --> 00:04:29.368
Make sure that I'm actually typing test account id

00:04:29.928 --> 00:04:32.968
now we can see that we have the test that we have.

00:04:32.968 --> 00:04:33.288
The,

00:04:34.678 --> 00:04:36.438
actual evaluations that have ran,

00:04:36.598 --> 00:04:38.038
they pull through into here.

00:04:38.118 --> 00:04:40.158
So these both have been tagged with unknown

00:04:40.158 --> 00:04:40.478
status.

00:04:40.478 --> 00:04:41.838
And as we run more evaluations,

00:04:41.838 --> 00:04:43.298
we're going to get different statuses here,

00:04:43.508 --> 00:04:45.388
to kind of prove out the concept of how this is

00:04:45.388 --> 00:04:45.668
working.

00:04:45.748 --> 00:04:46.148
So,

00:04:46.338 --> 00:04:47.138
that's pretty cool.

00:04:47.138 --> 00:04:48.138
So you can see when it ran,

00:04:48.138 --> 00:04:51.018
you can see the reason as to why the AI tagged it

00:04:51.018 --> 00:04:52.258
as unknown status.

00:04:52.958 --> 00:04:53.198
And,

00:04:53.358 --> 00:04:54.778
also you were able to have like,

00:04:54.778 --> 00:04:56.458
the URL of the actual page that was,

00:04:56.458 --> 00:04:56.898
ran.

00:04:56.898 --> 00:04:59.458
So I do expect this to tag it as like,

00:04:59.458 --> 00:05:00.298
product not found.

00:05:00.298 --> 00:05:00.818
So I think,

00:05:01.098 --> 00:05:02.638
we're going to probably dive a little bit deeper

00:05:02.638 --> 00:05:04.118
into the workflow itself.

00:05:04.118 --> 00:05:06.438
But I would also suggest you just kind of dive

00:05:06.438 --> 00:05:07.518
into Puppeteer to like,

00:05:07.518 --> 00:05:09.638
make sure the browser rendering is also,

00:05:10.178 --> 00:05:11.258
Everything is working there.

00:05:11.258 --> 00:05:12.920
But we'll kind of circle back on this

00:05:13.003 --> 00:05:13.403
now.

00:05:14.363 --> 00:05:16.683
at this point we're able to basically say,

00:05:16.683 --> 00:05:17.083
hey,

00:05:17.083 --> 00:05:18.133
for from end to end,

00:05:18.213 --> 00:05:19.893
we track link clicks,

00:05:20.053 --> 00:05:21.813
we run evaluations manually,

00:05:21.973 --> 00:05:23.333
we get that evaluation data,

00:05:23.333 --> 00:05:24.253
we save it in R2,

00:05:24.253 --> 00:05:25.773
we save it in our D1 database,

00:05:25.773 --> 00:05:27.493
and then we actually are able to wire that into

00:05:27.493 --> 00:05:28.053
our ui.

00:05:28.053 --> 00:05:30.573
So it's kind of like a holistic project that's

00:05:30.573 --> 00:05:32.813
coming together from front end to back and back to

00:05:32.813 --> 00:05:33.253
front end.

00:05:33.412 --> 00:05:33.813
So,

00:05:34.043 --> 00:05:34.773
this next section,

00:05:34.773 --> 00:05:36.013
we're actually going to start

00:05:36.333 --> 00:05:36.893
manual,

00:05:36.893 --> 00:05:38.653
or we're going to actually start building out the

00:05:38.653 --> 00:05:40.253
programmatic logic of how to

00:05:40.573 --> 00:05:42.453
determine when we're going to run evaluations

00:05:42.453 --> 00:05:44.293
using durable objects to do that in a more

00:05:44.293 --> 00:05:45.017
intelligent way.

