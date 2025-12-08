WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.092 --> 00:00:02.172
One quick update for the destination evaluation

00:00:02.172 --> 00:00:02.892
workflow.

00:00:03.292 --> 00:00:03.342
This,

00:00:03.432 --> 00:00:04.752
was pointed out to me by a student.

00:00:04.752 --> 00:00:06.032
This is an error that they are facing.

00:00:06.032 --> 00:00:08.152
And I do think that this potentially could be

00:00:08.152 --> 00:00:09.392
something that you encounter as well.

00:00:09.662 --> 00:00:11.702
basically there's this error at the very first

00:00:11.702 --> 00:00:14.262
step of the workflow that says the maximum allowed

00:00:14.262 --> 00:00:15.822
size is 1 MB.

00:00:15.902 --> 00:00:16.302
Now

00:00:16.622 --> 00:00:17.622
this very first step,

00:00:17.622 --> 00:00:18.862
what it's doing is it is

00:00:19.182 --> 00:00:19.302
using,

00:00:19.302 --> 00:00:21.582
browser rendering to render a page and it's

00:00:21.582 --> 00:00:23.582
collecting the HTML and then it's returning that.

00:00:23.582 --> 00:00:23.812
And,

00:00:23.882 --> 00:00:26.242
and then basically what's happening is that HTML

00:00:26.242 --> 00:00:28.602
and some other data is being passed to this saved

00:00:28.682 --> 00:00:29.482
step state.

00:00:29.562 --> 00:00:32.402
So this variable is basically being persisted

00:00:32.402 --> 00:00:33.202
across the workflow.

00:00:33.202 --> 00:00:35.392
And then Cloudflare is storing this on their end,

00:00:35.392 --> 00:00:36.482
inside of a durable object.

00:00:36.482 --> 00:00:39.002
Now they put some limits for the size that this

00:00:39.002 --> 00:00:39.322
could be.

00:00:39.322 --> 00:00:41.522
So the size of the response here for what can be

00:00:41.522 --> 00:00:41.922
saved,

00:00:42.372 --> 00:00:43.082
there's a limit.

00:00:43.082 --> 00:00:44.042
And that limit,

00:00:44.042 --> 00:00:44.722
like we showed,

00:00:44.722 --> 00:00:45.482
is one mb.

00:00:45.642 --> 00:00:48.082
And this should in theory be plenty if it's just

00:00:48.082 --> 00:00:49.402
like an HTML page.

00:00:49.402 --> 00:00:51.562
But because I also added the,

00:00:51.692 --> 00:00:53.192
last step of basically

00:00:53.802 --> 00:00:55.562
grabbing a screenshot of the page,

00:00:55.722 --> 00:00:57.802
it is possible that you could exceed this.

00:00:57.962 --> 00:01:00.122
So I did put in a really quick fix here.

00:01:00.122 --> 00:01:02.002
So this is basically the code that you're going to

00:01:02.002 --> 00:01:02.282
see,

00:01:02.402 --> 00:01:02.992
where we

00:01:03.312 --> 00:01:04.432
grab that page data,

00:01:04.672 --> 00:01:05.792
do the AI step,

00:01:06.132 --> 00:01:08.762
save the data into the database and this returns

00:01:08.762 --> 00:01:09.762
an evaluation id.

00:01:09.922 --> 00:01:12.802
And then we back all that data back up into R2.

00:01:12.802 --> 00:01:13.142
Now,

00:01:13.142 --> 00:01:15.082
I did do a little patch here that I'll go over and

00:01:15.082 --> 00:01:16.322
I'll share this code as well.

00:01:16.322 --> 00:01:18.162
But essentially the very first step,

00:01:18.642 --> 00:01:21.722
we are going to be creating an evaluation id and

00:01:21.722 --> 00:01:24.882
then we will be running our destination URL step.

00:01:25.042 --> 00:01:27.562
And essentially this last section where we're

00:01:27.562 --> 00:01:29.202
saving this data into R2,

00:01:29.672 --> 00:01:31.242
we're doing that inside of this step.

00:01:31.242 --> 00:01:33.642
This way we don't have to return like the image

00:01:33.642 --> 00:01:34.162
and stuff,

00:01:34.752 --> 00:01:37.122
as an output here from the first step.

00:01:37.122 --> 00:01:38.242
So we're just running through,

00:01:38.562 --> 00:01:40.242
we're creating our paths.

00:01:41.202 --> 00:01:43.922
we're saving this into our R2 bucket.

00:01:44.002 --> 00:01:45.802
And then the only thing that we're returning is

00:01:45.802 --> 00:01:47.722
we're returning the text of the page.

00:01:47.722 --> 00:01:49.042
Not even the whole HTML,

00:01:49.042 --> 00:01:49.642
just the text.

00:01:49.642 --> 00:01:50.392
So that's going to be,

00:01:50.622 --> 00:01:51.062
that should be,

00:01:51.062 --> 00:01:51.302
well,

00:01:51.302 --> 00:01:51.902
well under,

00:01:52.012 --> 00:01:52.622
one and B.

00:01:52.622 --> 00:01:54.622
And if you ever come across a scenario where for

00:01:54.622 --> 00:01:56.462
some reason the text exceeds that limit,

00:01:56.462 --> 00:01:57.262
then you could also,

00:01:57.262 --> 00:01:57.742
you know,

00:01:58.702 --> 00:01:58.712
not,

00:01:58.712 --> 00:02:00.702
return it here and then you could pull it from R2

00:02:00.702 --> 00:02:00.902
later.

00:02:00.902 --> 00:02:02.542
But I don't think that's ever really going to be a

00:02:02.542 --> 00:02:03.102
valid concern.

00:02:03.262 --> 00:02:06.022
And then we are returning the evaluation ID as

00:02:06.022 --> 00:02:06.302
well.

00:02:06.542 --> 00:02:08.180
So the AI step is the same here.

00:02:08.182 --> 00:02:08.822
And then,

00:02:09.082 --> 00:02:11.722
the very last step is saving in the database.

00:02:11.722 --> 00:02:14.762
So we're basically yanking out this R2 step,

00:02:15.242 --> 00:02:16.722
putting it inside of this first step.

00:02:16.722 --> 00:02:18.322
So there is kind of a lot happening in this step

00:02:18.322 --> 00:02:18.882
of the workflow,

00:02:18.882 --> 00:02:19.642
but that's totally fine.

00:02:19.642 --> 00:02:21.482
There's really no issue with this type of design.

00:02:22.122 --> 00:02:22.762
And then,

00:02:22.822 --> 00:02:25.702
the very last step is saving the evaluation and

00:02:25.702 --> 00:02:27.382
we're creating the evaluation id.

00:02:27.382 --> 00:02:30.941
So I updated this add evaluation function we used

00:02:30.941 --> 00:02:33.022
to create the ID randomly here,

00:02:33.262 --> 00:02:35.102
insert it into our database and return it.

00:02:35.342 --> 00:02:38.062
Now that random ID is being passed in at the top

00:02:38.062 --> 00:02:39.142
level of this function.

00:02:39.142 --> 00:02:40.462
So there's the two changes here,

00:02:40.462 --> 00:02:42.302
there's the small update to this workflow,

00:02:43.272 --> 00:02:45.832
then there is the removal of that step and

00:02:45.832 --> 00:02:47.952
basically making it so we pass in this id.

00:02:47.952 --> 00:02:48.992
So I'm going to share this code.

00:02:48.992 --> 00:02:50.582
This should be a really easy fix on your end.

00:02:50.932 --> 00:02:51.692
Hope this helps.

