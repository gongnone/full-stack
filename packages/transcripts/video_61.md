WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.082 --> 00:00:00.562
All right,

00:00:00.562 --> 00:00:02.482
so let's talk about some stretch goals.

00:00:02.482 --> 00:00:02.722
Like,

00:00:02.722 --> 00:00:04.842
as I've been building out this project and making

00:00:04.842 --> 00:00:05.482
these videos,

00:00:05.482 --> 00:00:06.362
I've kind of realized,

00:00:06.362 --> 00:00:06.642
like,

00:00:06.642 --> 00:00:08.722
there's a lot of directions that we can go,

00:00:09.362 --> 00:00:09.882
for like,

00:00:09.882 --> 00:00:11.442
features to add and different things that would be

00:00:11.442 --> 00:00:12.002
cool to build,

00:00:12.002 --> 00:00:13.202
but it's just really like,

00:00:13.202 --> 00:00:14.362
just too much for a course.

00:00:14.362 --> 00:00:14.882
And I know,

00:00:14.882 --> 00:00:15.202
like,

00:00:15.522 --> 00:00:18.242
probably 95% of people actually aren't able to

00:00:18.242 --> 00:00:19.402
make it to the very end,

00:00:19.402 --> 00:00:20.322
which is this video.

00:00:20.562 --> 00:00:22.162
So if you've made it this far,

00:00:22.162 --> 00:00:23.602
I think it means that you've gone really,

00:00:23.602 --> 00:00:24.642
really deep in this topic.

00:00:24.642 --> 00:00:24.882
And,

00:00:25.032 --> 00:00:26.552
and if you're interested in like,

00:00:26.552 --> 00:00:27.672
learning more and really like,

00:00:27.672 --> 00:00:29.032
testing your skills to,

00:00:29.642 --> 00:00:30.272
you know,

00:00:30.272 --> 00:00:31.632
be able to do things on your own and not just

00:00:31.632 --> 00:00:31.832
like,

00:00:31.832 --> 00:00:33.192
follow a guide from a video.

00:00:33.642 --> 00:00:35.512
I do have some different stretch goals that I do

00:00:35.512 --> 00:00:37.192
think would be really cool for you to think about

00:00:37.192 --> 00:00:38.312
and then figure out how to build.

00:00:38.312 --> 00:00:39.952
And if you do any of these stretch goals and

00:00:39.952 --> 00:00:41.432
you're impressed with your solution,

00:00:41.572 --> 00:00:43.632
I'd love if you reach out and like,

00:00:43.632 --> 00:00:44.592
kind of share what you did.

00:00:44.592 --> 00:00:45.392
Because I do,

00:00:45.392 --> 00:00:45.672
like,

00:00:45.672 --> 00:00:46.152
I am.

00:00:46.152 --> 00:00:46.992
I want to see like,

00:00:46.992 --> 00:00:49.432
what types of inspiration and  directions people

00:00:49.432 --> 00:00:50.072
take this project

00:00:50.482 --> 00:00:53.042
to kind of like bring it to a full productionized

00:00:53.042 --> 00:00:53.682
completeness.

00:00:53.682 --> 00:00:54.082
So,

00:00:54.642 --> 00:00:55.482
that being said,

00:00:55.482 --> 00:00:57.562
a few different stretch goals that I wanted to

00:00:57.562 --> 00:00:58.362
talk about is like,

00:00:58.362 --> 00:00:59.282
we are right now,

00:00:59.282 --> 00:01:01.402
we have this ability to take payments and we have

00:01:01.402 --> 00:01:02.042
different plans,

00:01:02.042 --> 00:01:03.602
but these plans really don't do anything.

00:01:03.602 --> 00:01:04.162
They're just like,

00:01:04.162 --> 00:01:06.482
here to have credit card on file.

00:01:06.562 --> 00:01:06.962
Now.

00:01:07.152 --> 00:01:09.322
these are just kind of like filler features and

00:01:09.322 --> 00:01:09.722
whatnot.

00:01:09.722 --> 00:01:09.962
So like,

00:01:09.962 --> 00:01:11.602
you could kind of think about what types of

00:01:11.602 --> 00:01:12.962
features would each plan have.

00:01:13.132 --> 00:01:15.362
and then how do I actually wire that into,

00:01:16.112 --> 00:01:16.692
the,

00:01:16.692 --> 00:01:18.572
the actual data service on the back end.

00:01:18.652 --> 00:01:19.012
So,

00:01:19.692 --> 00:01:20.772
one thing that I would.

00:01:20.772 --> 00:01:21.052
One,

00:01:21.052 --> 00:01:22.686
one feature I think would be cool is like,

00:01:22.686 --> 00:01:23.728
adding email to this.

00:01:23.728 --> 00:01:24.288
So like,

00:01:24.448 --> 00:01:27.288
whenever these evaluations go through and a link

00:01:27.288 --> 00:01:29.008
is determined not to be healthy,

00:01:29.008 --> 00:01:31.408
go ahead and like wire up an email provider.

00:01:31.408 --> 00:01:31.528
Like,

00:01:31.528 --> 00:01:32.608
you could use resend.

00:01:34.132 --> 00:01:34.172
This,

00:01:34.172 --> 00:01:36.972
is kind of like a platform to send out emails

00:01:36.972 --> 00:01:37.652
programmatically.

00:01:37.812 --> 00:01:38.212
So,

00:01:38.412 --> 00:01:41.772
you could basically say like every two days or

00:01:41.772 --> 00:01:43.452
whenever we have like a link.

00:01:43.452 --> 00:01:44.392
That's not healthy.

00:01:44.392 --> 00:01:46.712
let's go ahead and give that user an alert so

00:01:46.712 --> 00:01:46.872
like,

00:01:46.872 --> 00:01:48.032
they could go out and switch,

00:01:48.752 --> 00:01:49.952
to swap out that,

00:01:51.552 --> 00:01:51.912
that,

00:01:51.912 --> 00:01:53.472
that link with that for a healthy one.

00:01:53.792 --> 00:01:56.432
you could add like a feature where let's say you

00:01:56.432 --> 00:01:57.112
have a bunch of like,

00:01:57.112 --> 00:01:58.112
links from Amazon,

00:01:58.192 --> 00:02:01.232
you Could plug into Amazon's affiliate API and if

00:02:01.232 --> 00:02:03.952
like a product goes  like

00:02:04.272 --> 00:02:07.152
if a product is basically not available anymore or

00:02:07.392 --> 00:02:09.432
if another product is selling better,

00:02:09.432 --> 00:02:10.032
that's similar.

00:02:10.032 --> 00:02:11.872
Like you could probably plug into their API and

00:02:11.872 --> 00:02:12.512
you could build really,

00:02:12.512 --> 00:02:14.112
really cool features around like hey,

00:02:14.452 --> 00:02:16.602
you are marketing this product.

00:02:16.842 --> 00:02:18.562
You could actually become an affiliate for this

00:02:18.562 --> 00:02:19.402
product which is the same.

00:02:19.402 --> 00:02:20.162
It's a little bit cheaper,

00:02:20.162 --> 00:02:21.242
the shipping times faster.

00:02:21.242 --> 00:02:23.522
Like here's some like suggestions on how you can

00:02:23.522 --> 00:02:24.162
like optimize,

00:02:24.162 --> 00:02:25.882
make more money which would also be very,

00:02:25.882 --> 00:02:26.442
very cool.

00:02:26.838 --> 00:02:29.888
now another thing that I was thinking is like

00:02:29.888 --> 00:02:30.848
custom short links.

00:02:30.848 --> 00:02:34.168
So we kind of have just these like random short

00:02:34.248 --> 00:02:34.648
like

00:02:35.928 --> 00:02:36.224
like

00:02:36.288 --> 00:02:38.018
hashes of just some type of value.

00:02:38.418 --> 00:02:38.818
And

00:02:39.218 --> 00:02:40.818
these really just they don't look good

00:02:41.218 --> 00:02:42.178
when you're,

00:02:42.178 --> 00:02:43.298
when they're like being used.

00:02:43.298 --> 00:02:44.578
So like I would say go ahead.

00:02:45.118 --> 00:02:46.558
The ability for users to

00:02:47.038 --> 00:02:49.958
create their own  link name so like they could

00:02:49.958 --> 00:02:50.798
just call it their product.

00:02:50.798 --> 00:02:53.358
Now that comes with caveats because at scale if

00:02:53.358 --> 00:02:55.398
you're going to be doing this you need to find a

00:02:55.398 --> 00:02:58.038
way to basically when a user types it in quickly

00:02:58.038 --> 00:03:00.358
check if that link has been taken and if it hasn't

00:03:00.358 --> 00:03:00.718
been taken,

00:03:01.998 --> 00:03:04.158
like kind of like reserve it for a period of time

00:03:04.158 --> 00:03:05.958
and then when they save just make sure that that's

00:03:05.958 --> 00:03:07.098
indexed as

00:03:07.598 --> 00:03:08.118
you know,

00:03:08.118 --> 00:03:08.718
already taken.

00:03:08.878 --> 00:03:11.558
So building out like the unique links is another

00:03:11.558 --> 00:03:12.558
really cool one I think.

00:03:13.618 --> 00:03:14.588
custom domains.

00:03:14.588 --> 00:03:18.708
So like instead of stage.smartlink.com like you

00:03:18.708 --> 00:03:21.348
could say like oh we're going to make this a wild

00:03:21.348 --> 00:03:21.788
card.

00:03:21.788 --> 00:03:23.748
And then as a premium feature people could put

00:03:23.748 --> 00:03:24.668
their business here.

00:03:24.748 --> 00:03:27.788
Or better yet you could like point the backend

00:03:27.788 --> 00:03:30.348
service  as like a generic service and have a C

00:03:30.348 --> 00:03:30.588
name.

00:03:30.588 --> 00:03:32.908
A user can point their cname at like

00:03:33.348 --> 00:03:37.148
a random/smartlink.com and that's like their

00:03:37.228 --> 00:03:38.868
reserved backend service.

00:03:38.868 --> 00:03:39.388
And then

00:03:39.878 --> 00:03:41.238
you know they could point a C name at it.

00:03:41.238 --> 00:03:41.358
That,

00:03:41.358 --> 00:03:42.918
that would be another really cool thing to do.

00:03:42.928 --> 00:03:45.598
that kind of like goes down the rabbit hole of

00:03:45.598 --> 00:03:47.718
like multi tenant applications and whatnot.

00:03:48.142 --> 00:03:49.252
now there's a lot around

00:03:49.652 --> 00:03:51.132
smarter evaluation logic.

00:03:51.132 --> 00:03:53.172
But before that I actually thought of another one

00:03:53.172 --> 00:03:54.372
that could be kind of cool.

00:03:54.382 --> 00:03:57.389
so like you're probably noticing in here,

00:04:02.086 --> 00:04:03.886
you're probably noticing in here we don't have the

00:04:03.886 --> 00:04:06.446
ability to delete a link and it's kind of

00:04:06.446 --> 00:04:07.446
intentional because

00:04:07.846 --> 00:04:09.766
there's a lot of like caveats about deleting a

00:04:09.766 --> 00:04:10.046
link.

00:04:10.046 --> 00:04:12.326
Like what if you delete a link and

00:04:12.936 --> 00:04:14.246
it's a random like

00:04:14.886 --> 00:04:17.356
hash or maybe it's a user provided like

00:04:17.606 --> 00:04:18.086
link

00:04:18.486 --> 00:04:18.886
and

00:04:19.206 --> 00:04:21.046
there's like those short links still sitting out

00:04:21.046 --> 00:04:22.446
there on the Internet and people are clicking on

00:04:22.446 --> 00:04:22.606
them.

00:04:22.606 --> 00:04:24.406
And now let's just go into an offend page.

00:04:24.806 --> 00:04:26.726
that's another thing where it's like well what do

00:04:26.726 --> 00:04:27.166
we do?

00:04:27.166 --> 00:04:27.606
You know,

00:04:27.606 --> 00:04:28.246
like what,

00:04:29.046 --> 00:04:30.046
like how do you handle that?

00:04:30.046 --> 00:04:31.686
So having business logic around like

00:04:32.056 --> 00:04:34.776
maybe building out a feature where like all of

00:04:34.776 --> 00:04:35.096
the,

00:04:36.136 --> 00:04:37.656
all like if you delete a link,

00:04:37.816 --> 00:04:40.216
maybe having like a link category to like a

00:04:40.216 --> 00:04:41.936
category of products and then you could have like

00:04:41.936 --> 00:04:44.256
a generic landing page that a user can configure

00:04:44.256 --> 00:04:46.256
where they have like links to like similar

00:04:46.256 --> 00:04:47.775
products or products in that category.

00:04:47.775 --> 00:04:48.776
So if it's not found,

00:04:48.936 --> 00:04:51.776
it goes to that user's not found page which is

00:04:51.776 --> 00:04:52.856
very specific to them.

00:04:52.856 --> 00:04:55.176
Because right now our not found page is just like,

00:04:56.076 --> 00:04:56.876
like if we just

00:04:57.236 --> 00:04:59.036
basically do the incorrect link here are not found

00:04:59.036 --> 00:05:00.356
pages just like destination not found.

00:05:00.356 --> 00:05:00.636
Right.

00:05:00.636 --> 00:05:02.356
But maybe that not found page could be very

00:05:02.356 --> 00:05:05.076
specific to  like a user if,

00:05:05.476 --> 00:05:07.076
if like they delete

00:05:07.476 --> 00:05:08.116
a link.

00:05:08.116 --> 00:05:10.036
So instead of just removing it entirely from the

00:05:10.036 --> 00:05:10.476
database,

00:05:10.476 --> 00:05:12.036
maybe there's a lot of like smart things you can

00:05:12.036 --> 00:05:12.676
build around that.

00:05:12.676 --> 00:05:14.506
So that's like one direction to go.

00:05:14.506 --> 00:05:17.196
for these like additional  for additional

00:05:17.196 --> 00:05:18.516
features for a stretch goal.

00:05:19.956 --> 00:05:22.476
now there's a ton around smarter evaluation logic.

00:05:22.476 --> 00:05:24.196
So if we look at our data service

00:05:25.246 --> 00:05:27.726
and we look at our  destination track tracker,

00:05:27.726 --> 00:05:29.726
like we're really just you know,

00:05:29.726 --> 00:05:31.606
having a few hard coded statuses in here,

00:05:31.606 --> 00:05:31.886
available,

00:05:32.046 --> 00:05:32.766
unavailable,

00:05:32.766 --> 00:05:35.006
unknown status and whatnot right now.

00:05:35.726 --> 00:05:36.486
that's kind of like,

00:05:36.486 --> 00:05:37.686
it makes sense for E commerce.

00:05:37.686 --> 00:05:40.166
But there's like blog posts that like maybe are

00:05:40.166 --> 00:05:40.686
outdated.

00:05:41.726 --> 00:05:43.006
there's stuff around like

00:05:43.326 --> 00:05:44.886
looking at the status of the request,

00:05:44.886 --> 00:05:47.726
if it's a 404 or 401 or whatever before like

00:05:47.726 --> 00:05:49.006
running the AI check,

00:05:49.486 --> 00:05:50.846
there's a lot that we can do here.

00:05:50.846 --> 00:05:53.206
So like I would say like maybe you want to niche

00:05:53.206 --> 00:05:55.446
this product down for a very specific industry.

00:05:55.446 --> 00:05:56.436
Maybe it's just E Commerc

00:05:56.906 --> 00:05:58.026
or maybe you know,

00:05:58.026 --> 00:05:59.986
it's like affiliate tracking or something.

00:05:59.986 --> 00:06:02.746
And I'm having a smarter evaluation engine where

00:06:02.746 --> 00:06:05.786
like you really test what you can do with AI and

00:06:05.786 --> 00:06:08.066
have different agents that like can perform tasks

00:06:08.066 --> 00:06:10.586
to  kind of expand upon this.

00:06:10.586 --> 00:06:12.066
And I do think in the future I'm going to be

00:06:12.066 --> 00:06:14.106
making videos to kind of like enhance this,

00:06:14.106 --> 00:06:14.966
this concept,

00:06:15.546 --> 00:06:16.906
with agents and whatnot.

00:06:16.906 --> 00:06:17.306
So

00:06:17.566 --> 00:06:19.586
I think this is a really interesting area to

00:06:19.586 --> 00:06:19.986
think about.

00:06:19.986 --> 00:06:21.706
And then the Other one would be smarter

00:06:21.706 --> 00:06:22.226
scheduling.

00:06:22.226 --> 00:06:23.706
Because right now we're just kind of like,

00:06:23.706 --> 00:06:24.026
looking,

00:06:24.626 --> 00:06:27.416
we get a link click and then in a few days we

00:06:27.416 --> 00:06:29.016
kind of like buffer all those link clicks and we

00:06:29.016 --> 00:06:30.056
do the evaluation once.

00:06:30.056 --> 00:06:32.976
But maybe you have smarter logic where if a link

00:06:33.216 --> 00:06:33.616
is,

00:06:33.616 --> 00:06:34.496
hasn't been clicked,

00:06:34.496 --> 00:06:35.936
so maybe you keep track of like,

00:06:36.096 --> 00:06:36.576
you know,

00:06:36.576 --> 00:06:37.896
all of the link clicks and like,

00:06:37.896 --> 00:06:39.856
let's say a link hasn't been clicked in

00:06:40.256 --> 00:06:43.256
14 days or five months or whatever it may be,

00:06:43.256 --> 00:06:44.496
and then it was clicked.

00:06:44.656 --> 00:06:44.976
Well,

00:06:44.976 --> 00:06:46.896
what if you go run that evaluation right away,

00:06:47.166 --> 00:06:48.176
to see if it's healthy?

00:06:48.176 --> 00:06:50.176
Or maybe if you get like a burst of,

00:06:51.506 --> 00:06:52.226
a burst of like,

00:06:52.226 --> 00:06:54.386
link clicks for a given link that haven't been

00:06:54.386 --> 00:06:55.106
clicked in a while.

00:06:55.106 --> 00:06:57.786
So maybe like somebody posted a YouTube video a

00:06:57.786 --> 00:06:59.546
year ago on a product and they had that link in

00:06:59.546 --> 00:06:59.786
there,

00:06:59.786 --> 00:07:00.586
and then all of a sudden,

00:07:00.586 --> 00:07:02.026
for some reason the algorithm is pushing that

00:07:02.026 --> 00:07:04.186
video and then hundreds of people are watching the

00:07:04.186 --> 00:07:04.386
video.

00:07:04.386 --> 00:07:05.986
You're getting dozens of link clicks or hundreds

00:07:05.986 --> 00:07:07.506
of link clicks or thousands of link clicks.

00:07:07.506 --> 00:07:07.626
Like,

00:07:07.626 --> 00:07:09.826
maybe you could detect spikes in these link clicks

00:07:09.826 --> 00:07:10.546
on the back end,

00:07:10.866 --> 00:07:13.026
as like a separate type of workflow or separate

00:07:13.026 --> 00:07:13.626
type of like,

00:07:13.626 --> 00:07:14.866
durable object maybe.

00:07:15.026 --> 00:07:15.586
And then,

00:07:15.986 --> 00:07:17.226
if it kind of triggers like,

00:07:17.226 --> 00:07:17.426
hey,

00:07:17.426 --> 00:07:18.186
this is an anomaly,

00:07:18.186 --> 00:07:19.186
we're getting a lot of traffic here,

00:07:19.186 --> 00:07:21.106
maybe we go ahead and run that evaluation just to

00:07:21.106 --> 00:07:21.386
make sure,

00:07:21.386 --> 00:07:21.626
hey,

00:07:21.626 --> 00:07:21.906
like,

00:07:22.206 --> 00:07:23.016
this is healthy.

00:07:23.016 --> 00:07:24.136
And then maybe along with that,

00:07:24.136 --> 00:07:26.256
if you're getting like a spike in these events,

00:07:26.256 --> 00:07:26.776
maybe like,

00:07:26.776 --> 00:07:27.576
you give them alert,

00:07:27.576 --> 00:07:27.736
like,

00:07:27.736 --> 00:07:28.096
hey,

00:07:28.096 --> 00:07:28.496
this,

00:07:28.576 --> 00:07:28.946
this,

00:07:29.279 --> 00:07:31.759
this link is receiving like an abnormally large

00:07:31.759 --> 00:07:32.559
number of clicks.

00:07:32.559 --> 00:07:33.519
Something must be going on.

00:07:33.519 --> 00:07:33.839
Like,

00:07:33.839 --> 00:07:35.639
you can go ahead and take a look and make sure you

00:07:35.639 --> 00:07:37.239
want to see if you want to update those links or

00:07:37.239 --> 00:07:37.638
whatnot.

00:07:37.638 --> 00:07:39.119
So there's a lot that you could do around

00:07:39.119 --> 00:07:39.639
scheduling.

00:07:39.639 --> 00:07:39.799
So,

00:07:39.799 --> 00:07:39.959
like,

00:07:39.959 --> 00:07:40.279
I would say,

00:07:40.279 --> 00:07:40.479
like,

00:07:40.479 --> 00:07:41.039
think really hard.

00:07:41.039 --> 00:07:41.239
Like,

00:07:41.239 --> 00:07:42.999
what features would you want to see in this and

00:07:42.999 --> 00:07:44.479
see if you can go ahead and build them out.

00:07:44.559 --> 00:07:45.759
It's really up to you and like,

00:07:45.759 --> 00:07:46.639
what you can imagine,

00:07:46.779 --> 00:07:47.919
this product to be.

00:07:47.999 --> 00:07:49.999
And the other thing would be like the evaluation

00:07:49.999 --> 00:07:50.559
ui.

00:07:50.559 --> 00:07:51.039
So like,

00:07:51.039 --> 00:07:51.839
I would say

00:07:52.199 --> 00:07:52.879
you could create another,

00:07:52.879 --> 00:07:53.159
like,

00:07:53.159 --> 00:07:53.959
totally separate service,

00:07:54.039 --> 00:07:55.239
whatever framework you want,

00:07:55.479 --> 00:07:57.839
as practice of like rolling something totally

00:07:57.839 --> 00:07:58.359
from scratch,

00:07:58.359 --> 00:08:01.159
whether it be next JS or nuxt or spelled or,

00:08:01.239 --> 00:08:01.599
you know,

00:08:01.599 --> 00:08:03.279
just basic react or tanstack start,

00:08:03.279 --> 00:08:03.639
right?

00:08:03.959 --> 00:08:04.359
And,

00:08:04.519 --> 00:08:07.439
you could just kind of have like a admin type of

00:08:07.439 --> 00:08:10.279
UI where maybe you see all your users and whatnot,

00:08:10.279 --> 00:08:12.519
and you kind of see holistically different like

00:08:12.519 --> 00:08:14.839
accounts that are like getting a lot of traffic.

00:08:15.319 --> 00:08:16.879
and then one thing that you could do is you could

00:08:16.879 --> 00:08:18.679
have an entire section dedicated to

00:08:19.559 --> 00:08:20.839
like workflow evaluation.

00:08:20.999 --> 00:08:22.919
So you could holistically see all of the links

00:08:22.919 --> 00:08:23.799
that are being clicked

00:08:24.099 --> 00:08:25.339
and you could see the output.

00:08:25.339 --> 00:08:27.219
So like here if we go to our two

00:08:27.629 --> 00:08:28.104
bucket

00:08:28.423 --> 00:08:29.103
essentially,

00:08:29.103 --> 00:08:29.463
like,

00:08:29.853 --> 00:08:31.063
we're saving some data.

00:08:31.063 --> 00:08:33.263
Like we're saving like the body text and the HTML,

00:08:33.263 --> 00:08:35.023
but we also have these screenshots and like,

00:08:35.023 --> 00:08:36.743
these screenshots are going to show like

00:08:37.153 --> 00:08:38.543
the actual like rendered page,

00:08:38.543 --> 00:08:38.823
right?

00:08:38.823 --> 00:08:39.262
So like,

00:08:39.262 --> 00:08:40.023
maybe you could build

00:08:40.393 --> 00:08:43.223
some more workflows at an admin level to like

00:08:43.223 --> 00:08:44.543
evaluate our,

00:08:44.543 --> 00:08:44.823
our,

00:08:44.823 --> 00:08:45.303
predict

00:08:46.103 --> 00:08:48.343
our AI predictions actually doing well.

00:08:48.343 --> 00:08:49.943
And maybe you can create some type of scoring

00:08:49.943 --> 00:08:52.223
system on the back end so there's like a whole,

00:08:52.223 --> 00:08:53.863
the whole direction you can go with like

00:08:54.243 --> 00:08:55.603
admin types of operations.

00:08:55.603 --> 00:08:57.803
So I do think that this is like a pretty cool

00:08:57.803 --> 00:08:59.483
product and it's honestly something that

00:08:59.483 --> 00:09:01.523
realistically probably could be a real product.

00:09:02.083 --> 00:09:02.803
So yeah,

00:09:02.803 --> 00:09:03.523
if you're interested,

00:09:03.523 --> 00:09:04.723
I would say go ahead and like,

00:09:04.723 --> 00:09:05.563
try to extend this,

00:09:05.563 --> 00:09:07.683
this project like as far as you can go.

00:09:07.983 --> 00:09:09.683
get the reps in by doing things yourself,

00:09:09.683 --> 00:09:11.123
not just following this tutorial.

00:09:11.203 --> 00:09:12.043
Use this like,

00:09:12.043 --> 00:09:13.803
project as a framework that you add on to.

00:09:13.803 --> 00:09:14.883
Because I do think that's the best way of

00:09:14.883 --> 00:09:15.123
learning.

00:09:15.123 --> 00:09:15.323
Like,

00:09:15.323 --> 00:09:17.243
instead of spending all this time starting from

00:09:17.243 --> 00:09:17.683
scratch,

00:09:17.923 --> 00:09:19.443
getting to the point where you have something

00:09:19.443 --> 00:09:20.803
that's like working and a system,

00:09:21.123 --> 00:09:22.923
take this existing system that we've built

00:09:22.923 --> 00:09:24.803
together and extend it and try to like,

00:09:24.803 --> 00:09:26.823
figure out all these different features that you

00:09:26.823 --> 00:09:28.583
want and add those features.

00:09:28.583 --> 00:09:30.183
And as you add those features from scratch,

00:09:30.183 --> 00:09:31.103
you'll start learning like,

00:09:31.103 --> 00:09:31.383
oh,

00:09:31.383 --> 00:09:32.143
how would we do it?

00:09:32.143 --> 00:09:32.663
Or like,

00:09:32.663 --> 00:09:33.783
is this the best way of doing it?

00:09:33.783 --> 00:09:34.063
Or,

00:09:34.063 --> 00:09:34.383
you know,

00:09:34.383 --> 00:09:36.103
it'd be cool if I tried to use like durable

00:09:36.103 --> 00:09:37.263
objects for this type of use case,

00:09:37.263 --> 00:09:37.503
right?

00:09:37.503 --> 00:09:38.623
And you'll learn really,

00:09:38.623 --> 00:09:40.143
really quickly by doing it that way.

00:09:40.183 --> 00:09:41.543
and then just like reach out.

00:09:41.543 --> 00:09:42.423
If you build anything.

00:09:42.423 --> 00:09:42.663
Cool,

00:09:42.663 --> 00:09:43.143
let me know.

00:09:43.143 --> 00:09:45.263
I'd love to talk about it or like look into it or

00:09:45.263 --> 00:09:46.863
if you have like any like core questions,

00:09:46.863 --> 00:09:48.743
feel free to reach out because I think that this

00:09:48.743 --> 00:09:50.863
is like a really cool project to build upon.

00:09:51.183 --> 00:09:52.743
that's going to wrap it up for the course.

00:09:52.743 --> 00:09:53.183
I really,

00:09:53.183 --> 00:09:54.783
really hope you guys enjoyed,

00:09:55.703 --> 00:09:57.703
enjoyed this and you got a lot out of it.

00:09:57.783 --> 00:09:59.783
I worked really hard on putting this together and

00:09:59.783 --> 00:10:01.343
it was kind of hard to think of an idea where I

00:10:01.343 --> 00:10:03.623
could like touch on all of like the really core

00:10:03.623 --> 00:10:04.823
primitives within Cloudflare,

00:10:05.063 --> 00:10:06.383
be able to teach like,

00:10:06.383 --> 00:10:08.263
all of the semantics and the different like,

00:10:08.263 --> 00:10:10.263
ways of using and building upon Cloudflare,

00:10:10.263 --> 00:10:10.983
but also like,

00:10:11.382 --> 00:10:11.783
use,

00:10:12.323 --> 00:10:14.463
build like a real world use case.

00:10:14.463 --> 00:10:15.583
And I think this kind of like,

00:10:15.583 --> 00:10:16.783
checked all those boxes.

00:10:16.783 --> 00:10:17.103
So,

00:10:17.103 --> 00:10:17.423
yeah,

00:10:17.423 --> 00:10:18.423
I'd love your feedback.

00:10:18.483 --> 00:10:19.663
whether it's good or bad,

00:10:19.663 --> 00:10:20.543
and if there's any like,

00:10:20.543 --> 00:10:21.263
issues or whatnot,

00:10:21.263 --> 00:10:22.423
I'm definitely down to like,

00:10:22.423 --> 00:10:22.743
change,

00:10:22.923 --> 00:10:23.803
change videos,

00:10:23.803 --> 00:10:25.043
add content and whatnot.

00:10:25.043 --> 00:10:26.403
So have a good one.

