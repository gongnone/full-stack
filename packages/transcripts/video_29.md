WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.066 --> 00:00:00.546
All right,

00:00:00.546 --> 00:00:03.466
so now that we've completed the step that scrapes

00:00:03.466 --> 00:00:05.746
data from a website using browser rendering,

00:00:05.746 --> 00:00:08.706
we're going to move into the AI portion of this

00:00:08.706 --> 00:00:09.346
workflow,

00:00:09.586 --> 00:00:12.425
which is ultimately going to take the body text

00:00:12.425 --> 00:00:14.346
that's extracted from a website and it's going to

00:00:14.346 --> 00:00:17.506
pass it off to an AI workflow where the AI is

00:00:17.506 --> 00:00:19.506
going to determine the health of a specific page

00:00:19.506 --> 00:00:20.386
or the page content.

00:00:20.866 --> 00:00:21.266
So

00:00:21.516 --> 00:00:23.306
what we're going to be using in this section

00:00:23.656 --> 00:00:25.656
is the AI SDK by Vercel.

00:00:25.896 --> 00:00:28.256
And we're going to be using Cloudflare's built in

00:00:28.256 --> 00:00:29.016
AI workers

00:00:29.216 --> 00:00:30.796
product which basically gives you

00:00:30.856 --> 00:00:33.356
access to a whole bunch of different open source

00:00:33.356 --> 00:00:35.276
AI models that they host on their own

00:00:35.276 --> 00:00:35.840
infrastructure.

00:00:36.768 --> 00:00:40.288
Now the AI SDK has tons and tons of features.

00:00:40.288 --> 00:00:41.248
It's actually a very,

00:00:41.248 --> 00:00:43.008
very well built library in my opinion.

00:00:43.038 --> 00:00:45.848
it looks like the AI SDK 5 is now available.

00:00:46.088 --> 00:00:46.488
So

00:00:46.788 --> 00:00:48.348
essentially what we're going to do is we're just

00:00:48.348 --> 00:00:50.468
going to be interfacing with this as a pretty

00:00:50.468 --> 00:00:51.508
simple use case.

00:00:51.648 --> 00:00:54.008
like I think the vast majority of use cases right

00:00:54.008 --> 00:00:55.928
now or the things that are most popular that

00:00:55.928 --> 00:00:56.608
people are building

00:00:56.928 --> 00:01:00.008
is they're using this generate text method that's

00:01:00.008 --> 00:01:02.888
provided by the AI library from this AI SDK.

00:01:02.888 --> 00:01:05.208
Now there's so many different capabilities of this

00:01:05.208 --> 00:01:05.648
platform,

00:01:06.048 --> 00:01:08.488
but I think this is a great illustration of what

00:01:08.488 --> 00:01:10.688
it can do because if you look at the semantics

00:01:10.688 --> 00:01:10.968
here,

00:01:10.968 --> 00:01:12.528
you have generate text

00:01:12.888 --> 00:01:13.768
and you have a prompt,

00:01:13.768 --> 00:01:14.168
right?

00:01:14.568 --> 00:01:14.968
And

00:01:15.318 --> 00:01:17.438
from here you can basically pass in a model and

00:01:17.438 --> 00:01:19.478
they've done a whole bunch of like abstraction.

00:01:19.478 --> 00:01:20.318
So you can provide

00:01:20.868 --> 00:01:23.298
a model from a given provider and then under the

00:01:23.298 --> 00:01:25.138
hood of this generate text it's able to,

00:01:25.138 --> 00:01:25.578
you know,

00:01:25.578 --> 00:01:27.138
dynamically figure out how to use it.

00:01:27.218 --> 00:01:27.618
So

00:01:27.988 --> 00:01:28.628
what we're going,

00:01:28.628 --> 00:01:30.588
or just one other thing to call out is you can

00:01:30.588 --> 00:01:32.948
look at how this is structured OpenAI

00:01:33.588 --> 00:01:35.188
simply just using the OpenAI

00:01:37.128 --> 00:01:39.688
or the OpenAI provider passing in a specific model

00:01:39.928 --> 00:01:40.898
and anthropic

00:01:41.218 --> 00:01:42.738
Google or custom,

00:01:42.818 --> 00:01:43.698
which is kind of cool.

00:01:43.698 --> 00:01:44.978
So you can also build your own custom

00:01:45.058 --> 00:01:46.078
implementations of

00:01:46.078 --> 00:01:46.878
model providers.

00:01:46.878 --> 00:01:47.158
But

00:01:48.038 --> 00:01:50.038
what makes this really nice is we can experiment,

00:01:50.038 --> 00:01:50.538
we can use

00:01:50.538 --> 00:01:52.258
a whole bunch of different Cloudflare models,

00:01:52.258 --> 00:01:53.178
but we can also

00:01:53.738 --> 00:01:54.418
utilize

00:01:54.418 --> 00:01:56.208
a whole bunch of different providers and you can

00:01:56.208 --> 00:01:57.168
play with different prompts,

00:01:57.168 --> 00:01:58.968
you can play with different like models on how

00:01:58.968 --> 00:02:01.488
they perform with a given prompt and you can build

00:02:01.488 --> 00:02:01.848
really,

00:02:01.928 --> 00:02:03.048
really sophisticated

00:02:03.368 --> 00:02:05.888
evaluations of your AI output on the back end.

00:02:06.008 --> 00:02:06.488
if you want to.

00:02:06.488 --> 00:02:08.008
We're not going to go that deep into this course

00:02:08.008 --> 00:02:09.568
we're mostly just going to integrate this into our

00:02:09.568 --> 00:02:10.488
existing application

00:02:10.808 --> 00:02:13.408
but at the core this is kind of like how you use

00:02:13.408 --> 00:02:16.048
the AI SDK if you're just doing really basic text

00:02:16.048 --> 00:02:17.768
generation and I do encourage you to go deeper

00:02:17.768 --> 00:02:18.628
into this section

00:02:18.628 --> 00:02:20.188
if you want to see like the other capabilities

00:02:21.218 --> 00:02:23.858
Now one cool thing about the Cloudflare AI workers

00:02:23.858 --> 00:02:27.498
is they do realize that the AI SDK is very widely

00:02:27.498 --> 00:02:27.778
used

00:02:28.258 --> 00:02:30.338
so they ended up building their very own

00:02:30.591 --> 00:02:31.391
their very own

00:02:32.631 --> 00:02:35.511
implementation of a provider so you can install

00:02:35.511 --> 00:02:37.271
the workers AI provider

00:02:37.591 --> 00:02:39.611
and then what you can do is you're going to notice

00:02:39.611 --> 00:02:42.101
you basically define this model and you pass in

00:02:42.101 --> 00:02:43.741
the Cloudflare model here and then

00:02:44.141 --> 00:02:48.061
you're able to use the generate text from the AI

00:02:48.061 --> 00:02:48.701
SDK.

00:02:48.701 --> 00:02:51.421
So it's cool that it even works with Cloudflare's

00:02:51.421 --> 00:02:52.381
native built in

00:02:52.381 --> 00:02:55.121
offering for their AI for their AI models.

00:02:55.201 --> 00:02:57.241
So let's go ahead and start implementing the code

00:02:57.241 --> 00:02:57.647
for this.

00:02:57.799 --> 00:02:59.959
So what I'm going to do here is basically we're

00:02:59.959 --> 00:03:02.679
going to have a new step that passes in the body

00:03:02.759 --> 00:03:04.559
of the data that was scraped,

00:03:04.559 --> 00:03:05.439
but not just like the body,

00:03:05.439 --> 00:03:07.639
the actual extracted text from the body.

00:03:07.639 --> 00:03:10.359
Because you can imagine an HTML document is going

00:03:10.359 --> 00:03:12.439
to have a whole bunch of tags for like,

00:03:12.949 --> 00:03:14.989
formatting and styling and layout and whatnot.

00:03:14.989 --> 00:03:16.309
And that's just going to take up a whole bunch of

00:03:16.309 --> 00:03:16.669
tokens.

00:03:16.669 --> 00:03:18.789
It's going to be more expensive from the AI side,

00:03:18.869 --> 00:03:21.549
which is why we have extracted the,

00:03:21.619 --> 00:03:22.979
the text from the body.

00:03:23.139 --> 00:03:25.379
And then we're also returning this here just so we

00:03:25.379 --> 00:03:25.899
can use that.

00:03:25.899 --> 00:03:27.679
And that's going to just keep our

00:03:27.679 --> 00:03:29.689
it's going to keep our prompt more concise and

00:03:29.689 --> 00:03:30.569
it's going to be less,

00:03:30.889 --> 00:03:32.809
information that the model has to reason about.

00:03:32.889 --> 00:03:35.609
So it'll likely give us better outputs from the AI

00:03:35.609 --> 00:03:36.968
side of things and it will also be much,

00:03:36.968 --> 00:03:37.529
much cheaper.

00:03:38.029 --> 00:03:39.609
so what we're going to do is we're going to go

00:03:39.609 --> 00:03:42.369
into the helpers and we're going to go ahead and

00:03:42.369 --> 00:03:43.329
create a,

00:03:43.669 --> 00:03:46.769
file called AI Destination Checker ts.

00:03:47.619 --> 00:03:49.299
Now this file is going to be pretty,

00:03:49.379 --> 00:03:51.299
it's going to have a very simple method and we're

00:03:51.299 --> 00:03:53.149
going to be using the generate,

00:03:53.149 --> 00:03:54.117
Generate object

00:03:54.183 --> 00:03:54.583
from.

00:03:55.223 --> 00:03:57.143
Generate object from the AI SDK,

00:03:57.623 --> 00:04:00.223
slightly different from what we see here in this

00:04:00.223 --> 00:04:02.023
example where this is generate text.

00:04:02.023 --> 00:04:04.183
The reason we're using generate object is because

00:04:04.503 --> 00:04:06.863
we are going to be using structured output.

00:04:06.863 --> 00:04:08.743
We're not just going to be generating like raw

00:04:08.743 --> 00:04:09.103
text,

00:04:09.103 --> 00:04:10.983
but essentially the semantics,

00:04:11.013 --> 00:04:12.753
and the syntax here is going to be the exact,

00:04:12.753 --> 00:04:14.513
exact same as what you see here.

00:04:15.283 --> 00:04:17.603
now we're going to most likely have to install

00:04:19.165 --> 00:04:22.605
inside of data service pmpmi Zod Looks like

00:04:23.325 --> 00:04:25.725
Zod is currently not installed in this specific

00:04:25.725 --> 00:04:26.266
application.

00:04:27.318 --> 00:04:29.798
And then what we're going to do is we're going to

00:04:29.878 --> 00:04:31.558
first define a schema,

00:04:31.558 --> 00:04:32.638
an output schema.

00:04:32.638 --> 00:04:35.398
So we can use Zod to basically say,

00:04:35.398 --> 00:04:35.865
okay,

00:04:35.908 --> 00:04:37.668
I expect a specific type

00:04:37.848 --> 00:04:39.568
of data in a specific structure

00:04:39.888 --> 00:04:40.848
with specific

00:04:40.928 --> 00:04:43.928
values to be outputted from the,

00:04:43.928 --> 00:04:45.368
from a model output.

00:04:45.368 --> 00:04:47.368
So to kind of explain what that would look like,

00:04:47.368 --> 00:04:48.608
I have this copy and pasted.

00:04:48.848 --> 00:04:51.728
We're going to define this specific output schema.

00:04:51.728 --> 00:04:54.248
And what we're going to notice about this output

00:04:54.248 --> 00:04:56.688
schema is we can basically say

00:04:57.187 --> 00:04:59.313
is we can basically say we're going to define this

00:04:59.313 --> 00:05:00.423
Zod object and,

00:05:00.493 --> 00:05:03.133
and this odd object is going to have a payment

00:05:03.133 --> 00:05:03.565
status

00:05:03.565 --> 00:05:05.380
and the payment status is going to have two

00:05:05.380 --> 00:05:06.220
different properties.

00:05:06.220 --> 00:05:09.100
The first property is going to be just status and

00:05:09.100 --> 00:05:10.340
this is going to be an enum.

00:05:10.340 --> 00:05:12.140
And right now we just kind of have like three

00:05:12.140 --> 00:05:13.099
different statuses.

00:05:13.180 --> 00:05:14.540
We have available product,

00:05:14.780 --> 00:05:17.020
not available product or unknown status.

00:05:17.020 --> 00:05:19.580
Now this is a very much like an E commerce centric

00:05:19.580 --> 00:05:20.060
use case,

00:05:20.060 --> 00:05:22.140
but you could imagine you could make this more

00:05:22.140 --> 00:05:22.460
general.

00:05:22.460 --> 00:05:24.300
You can create whatever statuses you want.

00:05:24.300 --> 00:05:24.700
So

00:05:25.200 --> 00:05:26.800
when the AI is scanning the

00:05:27.040 --> 00:05:28.740
text of a specific web page,

00:05:28.980 --> 00:05:31.820
it's able to like not just tag from these three

00:05:31.820 --> 00:05:32.300
statuses,

00:05:32.300 --> 00:05:33.940
but you can kind of define your own concepts here.

00:05:33.940 --> 00:05:36.380
And this is where like really the experimentation

00:05:36.380 --> 00:05:38.820
of working with AI is really big because there's

00:05:38.820 --> 00:05:40.779
so many different things that it can do and it

00:05:40.779 --> 00:05:42.660
really just kind of depends on like what models,

00:05:42.760 --> 00:05:43.240
you're using,

00:05:43.480 --> 00:05:44.920
how you're structuring your prompt,

00:05:44.960 --> 00:05:46.980
kind of like the strategy and the vibes around how

00:05:46.980 --> 00:05:47.700
you work with it.

00:05:47.700 --> 00:05:49.540
So it is kind of an interesting aspect of

00:05:49.540 --> 00:05:51.380
engineering that's changed the way that I think

00:05:51.380 --> 00:05:52.140
about things because

00:05:52.710 --> 00:05:52.950
you know,

00:05:52.950 --> 00:05:54.910
like a lot of this is just kind of like how it

00:05:54.910 --> 00:05:56.310
feels where you know,

00:05:56.310 --> 00:05:58.630
it's less of like a deterministic output.

00:05:58.630 --> 00:06:00.630
But the good thing about the

00:06:01.030 --> 00:06:03.790
the structured output is we can guarantee that

00:06:03.790 --> 00:06:06.190
we're going to get result with this specific type.

00:06:06.190 --> 00:06:08.589
So you can see here we have status and we're

00:06:08.589 --> 00:06:10.150
providing these three different types.

00:06:10.310 --> 00:06:11.630
And what you can also do,

00:06:11.630 --> 00:06:13.030
a really nice thing about Zod,

00:06:13.260 --> 00:06:15.690
is you can pass in a description and this

00:06:15.690 --> 00:06:17.770
description can kind of like provide further

00:06:17.770 --> 00:06:19.890
context to the model as to what you're looking

00:06:19.890 --> 00:06:20.170
for.

00:06:20.170 --> 00:06:22.730
So here we basically say indicates the product's

00:06:22.730 --> 00:06:23.810
availability on the pa.

00:06:24.510 --> 00:06:24.750
available,

00:06:25.230 --> 00:06:27.070
the product appears available for purchase,

00:06:27.070 --> 00:06:27.550
not available,

00:06:27.710 --> 00:06:29.470
the product appears unavailable,

00:06:29.470 --> 00:06:29.910
sold out,

00:06:29.910 --> 00:06:30.470
discontinued,

00:06:30.470 --> 00:06:30.830
whatever.

00:06:30.830 --> 00:06:31.790
Right now,

00:06:32.030 --> 00:06:34.550
this is just kind of like a very simplified

00:06:34.550 --> 00:06:35.350
version of this prompt.

00:06:35.350 --> 00:06:36.670
We're actually going to have a more enhanced

00:06:36.670 --> 00:06:36.950
prompt.

00:06:36.950 --> 00:06:38.350
But what you can notice here is like we're

00:06:38.350 --> 00:06:39.509
basically just you know,

00:06:39.509 --> 00:06:42.750
providing some like extra help to the model so we

00:06:42.750 --> 00:06:42.990
can

00:06:43.850 --> 00:06:46.730
determine specifically what status that it should

00:06:46.730 --> 00:06:47.570
tag the given

00:06:47.890 --> 00:06:49.330
input text or the given

00:06:49.870 --> 00:06:52.510
text from a web page into specific statuses.

00:06:52.590 --> 00:06:52.935
Now

00:06:52.935 --> 00:06:55.351
we're also going to have this property status

00:06:55.351 --> 00:06:55.671
reason,

00:06:55.991 --> 00:06:58.671
where the status reason has a description that we

00:06:58.671 --> 00:07:00.991
provide to the model which basically says a

00:07:00.991 --> 00:07:02.031
concise explanation,

00:07:02.031 --> 00:07:03.271
citing specific words,

00:07:03.271 --> 00:07:03.751
phrases,

00:07:03.751 --> 00:07:04.311
patterns,

00:07:04.391 --> 00:07:06.391
from the context that lead to the status.

00:07:06.391 --> 00:07:07.431
If unknown status,

00:07:07.431 --> 00:07:09.751
explain why it was missing or ambiguous.

00:07:09.751 --> 00:07:12.511
So essentially like what I've noticed is when you

00:07:12.511 --> 00:07:13.831
want AI to tag

00:07:14.771 --> 00:07:16.611
specific statuses given a prompt,

00:07:16.851 --> 00:07:19.291
if you also ask it to provide a reason as to why

00:07:19.291 --> 00:07:20.691
it provided that status.

00:07:20.691 --> 00:07:22.811
It does a much better job at actually like

00:07:22.811 --> 00:07:24.011
providing accurate statuses.

00:07:24.011 --> 00:07:26.331
Now this is kind of like mostly just like vibe

00:07:26.331 --> 00:07:27.891
based and then also you know,

00:07:27.891 --> 00:07:30.011
evaluations that I've done on data sets.

00:07:30.011 --> 00:07:30.291
But

00:07:31.941 --> 00:07:34.501
just simply asking for like a one line or a very

00:07:34.501 --> 00:07:34.981
simple

00:07:35.111 --> 00:07:37.481
concise explanation as to why it did what it did

00:07:37.801 --> 00:07:39.801
oftentimes gives you better output.

00:07:40.631 --> 00:07:41.111
and then

00:07:41.124 --> 00:07:41.670
at the very,

00:07:41.670 --> 00:07:43.910
very top level here you're going to notice that

00:07:44.110 --> 00:07:45.070
have some other descriptions.

00:07:45.070 --> 00:07:46.470
And the good thing about the

00:07:46.790 --> 00:07:47.270
Zod,

00:07:47.590 --> 00:07:48.110
about these,

00:07:48.110 --> 00:07:48.830
this object,

00:07:48.830 --> 00:07:49.750
when you pass it descriptions,

00:07:49.750 --> 00:07:50.070
these

00:07:50.550 --> 00:07:51.670
descriptions are actually

00:07:52.070 --> 00:07:52.790
passed into

00:07:53.270 --> 00:07:54.269
the input prompt.

00:07:54.269 --> 00:07:56.202
Now if you remember early on in a few,

00:07:56.202 --> 00:07:59.722
a few videos ago I was showing the actual format

00:07:59.962 --> 00:08:02.282
that is passed if you make an open or if you make

00:08:02.282 --> 00:08:03.402
an API call to

00:08:03.962 --> 00:08:06.642
a provider that uses this JSON format for

00:08:06.642 --> 00:08:07.562
structured outputs.

00:08:07.562 --> 00:08:08.042
And then

00:08:08.382 --> 00:08:11.102
I noted that you know you can pass in a specific

00:08:11.102 --> 00:08:11.502
type,

00:08:11.502 --> 00:08:13.102
it's going to be in the JSON format and then you

00:08:13.102 --> 00:08:15.622
can provide a schema and that schema has you know

00:08:15.622 --> 00:08:15.902
like

00:08:16.262 --> 00:08:18.102
it's going to be of the type object and here are

00:08:18.102 --> 00:08:19.342
the properties within an object

00:08:19.662 --> 00:08:20.062
and

00:08:20.162 --> 00:08:22.482
you know you can also not showing in this use case

00:08:22.482 --> 00:08:23.162
but you can provide

00:08:23.562 --> 00:08:25.162
descriptions as to like

00:08:25.542 --> 00:08:27.662
what this property is like describing what that

00:08:27.662 --> 00:08:28.422
property should be.

00:08:28.742 --> 00:08:30.582
And this is being fed into

00:08:31.122 --> 00:08:31.642
the input

00:08:31.952 --> 00:08:34.512
of the prompt and then it's actually kind of like

00:08:34.902 --> 00:08:36.792
influencing how the model is going to behave and

00:08:36.792 --> 00:08:38.632
then it's going to be enforcing that this specific

00:08:38.632 --> 00:08:39.472
type on the way back.

00:08:39.472 --> 00:08:42.032
Now this is a curl and you can see that this is

00:08:42.032 --> 00:08:42.592
kind of like,

00:08:42.592 --> 00:08:44.392
kind of a complicated structure to work with.

00:08:44.392 --> 00:08:44.992
It's going to be,

00:08:44.992 --> 00:08:45.352
you know,

00:08:45.352 --> 00:08:47.232
if you were to type this out on your own it'd be a

00:08:47.232 --> 00:08:48.192
little bit tedious.

00:08:48.272 --> 00:08:48.672
So

00:08:49.232 --> 00:08:51.792
you know what OpenAI has done is

00:08:52.112 --> 00:08:53.952
they've basically used Zod,

00:08:54.032 --> 00:08:55.712
which is kind of what we've done here.

00:08:55.872 --> 00:08:59.352
And they have inside of here this Zod text format.

00:08:59.352 --> 00:09:01.792
So you basically pass it in a schema

00:09:02.172 --> 00:09:04.492
like here and then you give it a name and

00:09:05.042 --> 00:09:05.812
it's able to

00:09:06.132 --> 00:09:08.412
take this schema and kind of iterate through that

00:09:08.412 --> 00:09:11.932
schema and create the exact same structure as what

00:09:11.932 --> 00:09:12.612
you see here.

00:09:12.612 --> 00:09:14.932
So it's not magic that's happening when we're

00:09:14.932 --> 00:09:16.212
passing in like an actual,

00:09:16.532 --> 00:09:16.972
you know,

00:09:16.972 --> 00:09:18.452
programmatic Zod schema here.

00:09:18.452 --> 00:09:19.732
It just is really simple.

00:09:19.732 --> 00:09:20.772
They have this like

00:09:21.102 --> 00:09:22.639
they have this library that.

00:09:22.639 --> 00:09:24.093
They have this library that is

00:09:24.221 --> 00:09:26.553
helping you know convert a Zod schema into a

00:09:26.553 --> 00:09:28.513
schema that their API recognizes.

00:09:28.513 --> 00:09:29.793
So there's really no magic here.

00:09:30.023 --> 00:09:30.533
and then

00:09:30.913 --> 00:09:32.593
on the AI side of things,

00:09:32.673 --> 00:09:33.033
what,

00:09:33.033 --> 00:09:35.153
what we're going to notice is when we pass it in

00:09:35.153 --> 00:09:35.553
to

00:09:35.953 --> 00:09:39.233
a helper method from the AISDK under the hood,

00:09:39.233 --> 00:09:40.353
they're most likely using

00:09:40.673 --> 00:09:42.993
this exact same dependency here.

00:09:43.013 --> 00:09:44.113
maybe they're using something different,

00:09:44.113 --> 00:09:45.233
maybe they're doing it on their,

00:09:45.233 --> 00:09:45.793
on their end,

00:09:45.793 --> 00:09:47.993
but they're probably just under the hood also

00:09:47.993 --> 00:09:48.753
using this.

00:09:48.753 --> 00:09:50.953
So there's just a lot of layers of abstraction.

00:09:50.953 --> 00:09:52.793
I just want to make sure we kind of like touch on

00:09:52.793 --> 00:09:53.633
a few of these layers.

00:09:53.633 --> 00:09:54.273
Just so you know,

00:09:54.273 --> 00:09:54.593
like,

00:09:54.753 --> 00:09:55.633
if you wanted to,

00:09:55.633 --> 00:09:57.193
you could use a normal API call,

00:09:57.193 --> 00:09:59.153
you could provide this really verbose schema and

00:09:59.153 --> 00:10:00.273
you're going to get that type back.

00:10:00.443 --> 00:10:01.923
Now if you want to like make things more

00:10:01.923 --> 00:10:03.203
programmatic and easier to manage,

00:10:03.203 --> 00:10:05.203
you're probably going to be using some type of

00:10:05.203 --> 00:10:05.963
schema library.

00:10:05.963 --> 00:10:07.883
So Python has something called pydantic,

00:10:08.283 --> 00:10:11.083
but in TypeScript or JavaScript you have Zod and

00:10:11.083 --> 00:10:11.643
then you know,

00:10:11.643 --> 00:10:14.283
this is able to go from like a Zod schema to their

00:10:14.363 --> 00:10:17.003
specific JSON schema that their API expects.

00:10:17.083 --> 00:10:19.003
So let's actually move into

00:10:19.323 --> 00:10:20.123
using this.

00:10:20.283 --> 00:10:21.473
So we have this

00:10:21.473 --> 00:10:23.663
method or this function called aidestination

00:10:23.663 --> 00:10:24.223
checker.

00:10:24.223 --> 00:10:25.783
Now first thing that we're going to do

00:10:26.213 --> 00:10:28.533
is we're going to define a workers AI.

00:10:28.933 --> 00:10:31.813
And what this does is it essentially creates

00:10:31.983 --> 00:10:33.663
a object that

00:10:33.983 --> 00:10:34.783
takes into

00:10:35.103 --> 00:10:35.503
the

00:10:35.693 --> 00:10:38.219
that takes in the context of this specific

00:10:38.220 --> 00:10:38.740
binding,

00:10:38.740 --> 00:10:39.660
which is our

00:10:40.280 --> 00:10:40.800
AI.

00:10:40.800 --> 00:10:41.400
Oh yeah,

00:10:41.560 --> 00:10:42.160
One thing,

00:10:42.160 --> 00:10:43.920
we probably should have done this a little bit

00:10:43.920 --> 00:10:44.200
earlier.

00:10:44.600 --> 00:10:47.520
Let's head to our wrangler JSON C file in our data

00:10:47.520 --> 00:10:47.880
service

00:10:48.440 --> 00:10:50.400
and in the binding what we're going to do is we're

00:10:50.400 --> 00:10:53.050
going to be adding this AI and dependency and

00:10:53.050 --> 00:10:55.290
we're going to give it the binding name AI here.

00:10:55.690 --> 00:10:57.090
Now when we run PNPM,

00:10:57.090 --> 00:10:57.930
run CF

00:10:58.810 --> 00:10:59.530
type gen,

00:10:59.552 --> 00:11:02.113
it's going to generate that type and then now we

00:11:02.113 --> 00:11:04.313
should see if we say EMB A,

00:11:04.873 --> 00:11:06.073
it's going to provide,

00:11:06.073 --> 00:11:08.553
it's going to basically pass in this AI binding

00:11:08.873 --> 00:11:10.313
into this helper

00:11:10.323 --> 00:11:12.633
function that Cloudflare is providing us.

00:11:12.633 --> 00:11:14.993
And then from there what we can do is we can

00:11:14.993 --> 00:11:17.753
essentially say we're going to actually pass in

00:11:17.753 --> 00:11:18.513
the body text

00:11:18.793 --> 00:11:20.233
to our API provider

00:11:20.793 --> 00:11:23.593
and this is going to be using the generate object

00:11:23.593 --> 00:11:24.919
from our AI SDK.

00:11:24.919 --> 00:11:26.978
And what this is going to take is this is going to

00:11:26.978 --> 00:11:27.778
take a model

00:11:28.098 --> 00:11:30.418
and for now we're going to be using our workers

00:11:30.498 --> 00:11:31.138
AI,

00:11:31.768 --> 00:11:32.838
variable that we defined

00:11:33.318 --> 00:11:34.998
and we will be passing in

00:11:35.518 --> 00:11:37.718
a specific model that we want to use.

00:11:37.718 --> 00:11:39.118
Now you're going to notice that,

00:11:40.108 --> 00:11:41.268
they kind of allow you.

00:11:41.268 --> 00:11:42.348
Because this is typescript,

00:11:42.348 --> 00:11:44.588
they have like all of these as specific

00:11:44.928 --> 00:11:46.528
models that we can pass into here.

00:11:46.768 --> 00:11:47.808
Now I have one here.

00:11:47.808 --> 00:11:48.368
This is

00:11:48.628 --> 00:11:49.348
one from Meta.

00:11:49.348 --> 00:11:50.348
It performs pretty well,

00:11:50.348 --> 00:11:52.828
but you can definitely play around with the models

00:11:52.828 --> 00:11:54.388
that support the structured output.

00:11:54.388 --> 00:11:55.588
You can pass them into here.

00:11:55.588 --> 00:11:55.988
So,

00:11:56.672 --> 00:11:59.013
now it looks like we are getting an issue here.

00:11:59.173 --> 00:12:00.213
Why is that the case?

00:12:00.941 --> 00:12:01.997
just one second here.

00:12:01.997 --> 00:12:04.477
So we're passing the model and then we're also

00:12:04.477 --> 00:12:05.517
going to give it a prompt.

00:12:05.597 --> 00:12:07.317
So the prompt that we're going to give it is just

00:12:07.317 --> 00:12:07.917
going to be like,

00:12:08.157 --> 00:12:10.237
is this product available for purchase?

00:12:10.397 --> 00:12:11.757
So we'll pass in this prompt,

00:12:12.327 --> 00:12:14.167
is this product available for purchase?

00:12:14.247 --> 00:12:15.847
And then we're also going to

00:12:16.487 --> 00:12:16.497
pass,

00:12:16.707 --> 00:12:17.067
in

00:12:17.467 --> 00:12:20.427
the body text that we're passing into this method.

00:12:20.427 --> 00:12:22.587
So in the prompt it's just going to be like this

00:12:22.587 --> 00:12:25.347
big block of the text that we scraped from the web

00:12:25.347 --> 00:12:25.707
page.

00:12:25.947 --> 00:12:27.986
And then we're also going to pass in the schema,

00:12:27.986 --> 00:12:29.168
which is the output schema.

00:12:29.529 --> 00:12:29.965
All right,

00:12:29.965 --> 00:12:31.005
so as you can see here,

00:12:31.085 --> 00:12:32.765
we're essentially defining this result.

00:12:33.285 --> 00:12:35.805
we're awaiting generate object instead of generate

00:12:35.805 --> 00:12:36.085
text.

00:12:36.085 --> 00:12:38.325
So we're not generating text like this example,

00:12:38.485 --> 00:12:40.805
we're generating an object and that object

00:12:40.805 --> 00:12:42.465
requires output schema.

00:12:42.465 --> 00:12:43.985
And that's what we've defined right here.

00:12:43.985 --> 00:12:46.665
We've passed in the prompt with the entire body

00:12:46.665 --> 00:12:47.056
text.

00:12:47.056 --> 00:12:49.259
And then we've also passed in our model which is

00:12:49.259 --> 00:12:51.259
using this workers AI wrapper.

00:12:51.259 --> 00:12:51.659
So

00:12:51.979 --> 00:12:54.299
now what we can do is we can just simply.

00:12:54.379 --> 00:12:56.219
We're going to return a few things here.

00:12:57.509 --> 00:12:59.989
this response is going to give us a status from

00:12:59.989 --> 00:13:02.229
the API and it's going to give us a status reason.

00:13:02.309 --> 00:13:04.069
So it's basically going to give us

00:13:04.389 --> 00:13:06.309
this right here and this right here.

00:13:06.389 --> 00:13:07.749
These are the things that we care about.

00:13:07.909 --> 00:13:09.909
So we can say status and,

00:13:09.979 --> 00:13:12.311
and this is going to be result.object.

00:13:12.910 --> 00:13:14.482
pagestatus.status.

00:13:14.802 --> 00:13:16.482
and then we can say status,

00:13:16.482 --> 00:13:16.802
region,

00:13:17.042 --> 00:13:18.482
Reason is going to be the same thing.

00:13:18.482 --> 00:13:20.722
So this is going to provide us both of these,

00:13:20.912 --> 00:13:21.712
which is kind of cool.

00:13:21.712 --> 00:13:22.152
It's kind of,

00:13:22.152 --> 00:13:24.112
it's kind of nice how concise this code is.

00:13:24.752 --> 00:13:26.432
right now we've kind of defined the prompt in our

00:13:26.432 --> 00:13:26.872
code base,

00:13:26.872 --> 00:13:27.632
but there are like,

00:13:27.632 --> 00:13:29.672
ways you can kind of abstract that into a separate

00:13:29.672 --> 00:13:29.912
service.

00:13:29.912 --> 00:13:31.512
If you're building something really robust where

00:13:31.512 --> 00:13:33.632
you want to like play around with a whole bunch of

00:13:33.632 --> 00:13:34.312
different prompts.

00:13:34.312 --> 00:13:35.192
But for now,

00:13:35.192 --> 00:13:36.272
I think this is good enough.

00:13:36.412 --> 00:13:37.612
what we can do from here

00:13:38.050 --> 00:13:39.907
is we can head over to our workflow

00:13:39.907 --> 00:13:41.579
and we will be adding a new step.

00:13:41.819 --> 00:13:43.819
So this step is going to be called

00:13:44.579 --> 00:13:45.299
evaluation.

00:13:45.948 --> 00:13:46.250
Well,

00:13:46.552 --> 00:13:48.312
we'll call this AI status.

00:13:48.392 --> 00:13:52.992
So AI status is going to define a step and it's

00:13:52.992 --> 00:13:55.032
going to say use AI to check the page status.

00:13:55.272 --> 00:13:58.392
And because this is an AI operation where,

00:13:58.972 --> 00:14:00.612
it could be computationally expensive,

00:14:00.612 --> 00:14:01.572
it could also charge,

00:14:01.572 --> 00:14:02.492
it could charge a lot,

00:14:02.492 --> 00:14:03.452
it's going to be slower.

00:14:03.772 --> 00:14:06.292
I don't want some type of issue to be going on

00:14:06.292 --> 00:14:07.852
with the provider or the code where

00:14:08.252 --> 00:14:09.012
if it fails,

00:14:09.012 --> 00:14:09.812
it keeps retrying.

00:14:09.812 --> 00:14:11.332
Let's say it retries three times and it

00:14:11.332 --> 00:14:12.092
continuously fails,

00:14:12.092 --> 00:14:13.412
and then we just kind of eat that cost.

00:14:13.412 --> 00:14:14.452
I like to kind of keep,

00:14:14.452 --> 00:14:16.412
whenever I do types of AI operations,

00:14:16.732 --> 00:14:19.092
I like to keep it to just have like one or zero

00:14:19.092 --> 00:14:19.692
retries,

00:14:19.692 --> 00:14:21.212
just so we can control that spend.

00:14:21.582 --> 00:14:23.465
and then we're going to import our AI checker.

00:14:23.510 --> 00:14:25.030
And it looks like I have a different name here.

00:14:25.030 --> 00:14:25.350
So,

00:14:25.350 --> 00:14:26.270
collected data,

00:14:26.270 --> 00:14:28.253
and we're going to pass in the data body text.

00:14:28.341 --> 00:14:29.461
So this should return,

00:14:29.841 --> 00:14:31.171
this should return the,

00:14:31.921 --> 00:14:32.321
the,

00:14:32.401 --> 00:14:34.561
the AI status and the AI status reason.

00:14:34.641 --> 00:14:36.361
So just to kind of recap what we have here,

00:14:36.361 --> 00:14:39.361
we have a workflow that takes collected data.

00:14:39.921 --> 00:14:43.081
It goes and it scrapes the web page that we

00:14:43.081 --> 00:14:44.801
provide into this workflow.

00:14:45.291 --> 00:14:46.571
It gets the HTML,

00:14:46.571 --> 00:14:47.691
it also gets the body text,

00:14:47.691 --> 00:14:49.651
and then it uses the body text right here and it

00:14:49.651 --> 00:14:51.211
stuffs that body text into,

00:14:52.071 --> 00:14:56.111
an AI prompt that is using the generate object

00:14:56.111 --> 00:14:59.231
from the AI SDK to give us a structured output to

00:14:59.231 --> 00:15:01.591
kind of figure out the availability of a given

00:15:01.831 --> 00:15:03.511
product page or a given website.

00:15:04.151 --> 00:15:05.511
So what we can do from here

00:15:05.911 --> 00:15:07.671
is we can go ahead and deploy this.

00:15:07.671 --> 00:15:08.751
So we can try to like,

00:15:08.751 --> 00:15:10.431
actually run and test this OP and pm.

00:15:10.431 --> 00:15:10.791
Run,

00:15:11.731 --> 00:15:12.078
deploy.

00:15:12.103 --> 00:15:14.743
So now that this has been successfully deployed,

00:15:14.743 --> 00:15:17.063
let's head over to our Cloudflare dashboard,

00:15:17.383 --> 00:15:19.303
head over to compute and workers,

00:15:19.463 --> 00:15:20.463
go to workflows,

00:15:20.463 --> 00:15:22.743
and then let's click on the specific workflow that

00:15:22.743 --> 00:15:23.383
we have in mind.

00:15:23.463 --> 00:15:25.503
Now I'm going to go ahead and say trigger again.

00:15:25.503 --> 00:15:27.143
And what I've done here is I have a

00:15:27.573 --> 00:15:28.053
input,

00:15:28.053 --> 00:15:29.293
which is taking the link id,

00:15:29.783 --> 00:15:33.423
the destination URL and the test account ID here.

00:15:33.423 --> 00:15:33.663
Now,

00:15:33.663 --> 00:15:33.863
really,

00:15:33.863 --> 00:15:35.703
the only thing that we care about at this moment

00:15:35.783 --> 00:15:37.103
is this destination URL.

00:15:37.103 --> 00:15:38.983
And what I did is I went online and I found

00:15:39.303 --> 00:15:41.863
some AliExpress product that is currently

00:15:42.263 --> 00:15:44.623
no Longer available because it's kind of an older

00:15:44.623 --> 00:15:44.903
product.

00:15:45.143 --> 00:15:45.543
So

00:15:45.743 --> 00:15:48.243
this is a great use case where we can see like we

00:15:48.243 --> 00:15:48.923
should see it,

00:15:48.923 --> 00:15:50.283
tag it as not

00:15:50.603 --> 00:15:52.603
as basically saying this product is not available.

00:15:53.343 --> 00:15:54.903
so let's go ahead and trigger that workflow.

00:15:54.903 --> 00:15:56.463
It's probably going to take a few seconds for it

00:15:56.463 --> 00:15:58.103
to kick off because essentially you have to go

00:15:58.103 --> 00:15:58.623
scrape the

00:15:58.623 --> 00:15:59.543
content of that page

00:15:59.943 --> 00:16:02.043
and then the next step is going to be passing it

00:16:02.043 --> 00:16:02.883
into the AI.

00:16:02.963 --> 00:16:05.203
So I'm going to go ahead and

00:16:06.103 --> 00:16:08.423
skip essentially to the section where this is

00:16:08.423 --> 00:16:08.695
done.

00:16:09.056 --> 00:16:11.536
So we can now see in real time that this has

00:16:11.616 --> 00:16:12.876
popped up as running.

00:16:12.876 --> 00:16:13.276
So

00:16:13.626 --> 00:16:14.546
the first step is running.

00:16:14.546 --> 00:16:16.706
We are collecting the render destination page.

00:16:16.706 --> 00:16:19.226
So we are scraping the web page and this is going

00:16:19.226 --> 00:16:19.986
to be a bit of a delay.

00:16:19.986 --> 00:16:21.666
I would actually suspect that this workflow is

00:16:21.666 --> 00:16:22.466
done at this point.

00:16:22.466 --> 00:16:22.866
Yep,

00:16:22.866 --> 00:16:23.346
there we go.

00:16:23.346 --> 00:16:23.706
So

00:16:24.526 --> 00:16:26.526
now both of our steps are defined,

00:16:26.526 --> 00:16:27.606
are completed here.

00:16:27.606 --> 00:16:29.946
If you noticed before when we ran this we only had

00:16:29.946 --> 00:16:30.266
one step.

00:16:30.266 --> 00:16:31.826
But now that we've defined a second step in our

00:16:31.826 --> 00:16:33.746
workflow we have that second step here.

00:16:33.746 --> 00:16:36.786
And this says use AI to check if the status of a

00:16:36.786 --> 00:16:37.106
page.

00:16:37.106 --> 00:16:39.306
You use AI to check status of page.

00:16:39.306 --> 00:16:42.146
So you can see that the output is status product

00:16:42.146 --> 00:16:42.746
not available

00:16:43.066 --> 00:16:44.066
and it gives us a reason.

00:16:44.066 --> 00:16:45.666
And the product appears to be unavailable,

00:16:45.666 --> 00:16:46.066
sold out,

00:16:46.066 --> 00:16:46.546
discontinued,

00:16:46.546 --> 00:16:49.626
etc because the due to zero quantity.

00:16:49.866 --> 00:16:52.026
in the help section which indicates

00:16:52.156 --> 00:16:52.476
the,

00:16:52.476 --> 00:16:52.836
the,

00:16:53.956 --> 00:16:54.836
which indicate

00:16:55.776 --> 00:16:57.176
the availability of purchase.

00:16:57.176 --> 00:16:59.006
So it did successfully

00:16:59.006 --> 00:17:01.076
tag this as saying it was not available.

00:17:01.236 --> 00:17:01.636
Now

00:17:01.896 --> 00:17:03.976
I would honestly expect it to pull

00:17:04.296 --> 00:17:05.536
to like reference this,

00:17:05.536 --> 00:17:07.056
you know instead of quantity.

00:17:07.056 --> 00:17:07.416
But

00:17:07.996 --> 00:17:09.476
it did successfully tag it.

00:17:09.476 --> 00:17:11.456
So what we're going to do is one last thing here.

00:17:11.966 --> 00:17:12.326
I,

00:17:12.326 --> 00:17:14.406
I mentioned that this prompt is kind of like bare

00:17:14.406 --> 00:17:14.686
bones.

00:17:14.686 --> 00:17:15.566
It's really simple.

00:17:15.886 --> 00:17:18.486
Now typically like you want your prompts to be

00:17:18.486 --> 00:17:19.806
pretty descriptive and

00:17:20.586 --> 00:17:21.306
longer really.

00:17:21.526 --> 00:17:24.286
so what I have here is I have a prompt that I was

00:17:24.286 --> 00:17:25.046
playing around with

00:17:25.206 --> 00:17:27.186
a few days ago that works really well for this use

00:17:27.186 --> 00:17:27.346
case.

00:17:27.346 --> 00:17:28.826
So I'm going to go ahead and paste it in here and

00:17:28.826 --> 00:17:29.706
we'll just go over it.

00:17:31.066 --> 00:17:33.066
So now essentially what we have is

00:17:33.226 --> 00:17:35.906
the exact same code passing in the EMB and the

00:17:35.906 --> 00:17:36.546
body text,

00:17:36.586 --> 00:17:38.166
passing in the AI worker

00:17:38.486 --> 00:17:39.206
binding.

00:17:39.286 --> 00:17:42.086
Now we have a prompt that's going to be like much,

00:17:42.086 --> 00:17:43.166
much more descriptive.

00:17:43.166 --> 00:17:46.006
So at the prompt level we kind of say like you're

00:17:46.006 --> 00:17:47.806
going to analyze the webpage content and we give

00:17:47.806 --> 00:17:49.606
it a really good explanation as to what it's Going

00:17:49.606 --> 00:17:49.926
to do

00:17:51.156 --> 00:17:51.876
pass in the,

00:17:51.974 --> 00:17:53.816
we pass in the steps or the

00:17:53.888 --> 00:17:55.952
the goal that it's supposed to accomplish.

00:17:55.952 --> 00:17:58.632
So like identify language that indicates if a

00:17:58.632 --> 00:17:58.872
product,

00:17:59.272 --> 00:18:00.312
the product is available,

00:18:00.772 --> 00:18:03.532
or indicates the product's unavailability or the

00:18:03.532 --> 00:18:04.372
unknown status.

00:18:04.372 --> 00:18:04.772
Right.

00:18:04.782 --> 00:18:06.002
so we have like a very,

00:18:06.002 --> 00:18:08.762
very clear explanation as to what the model is

00:18:08.762 --> 00:18:09.442
supposed to do.

00:18:09.522 --> 00:18:10.082
And then

00:18:10.662 --> 00:18:12.902
we kind of delineate between the prompt and the

00:18:12.902 --> 00:18:15.422
web page and then we pass in the web page content

00:18:15.422 --> 00:18:16.022
right here.

00:18:16.022 --> 00:18:17.862
So we've just kind of enhanced this prompt just to

00:18:17.862 --> 00:18:19.502
give it a structure that's going to be a little

00:18:19.502 --> 00:18:21.782
bit more interpretable by these large language

00:18:21.782 --> 00:18:22.262
models.

00:18:22.262 --> 00:18:24.222
And then we also give it a much better system

00:18:24.222 --> 00:18:24.764
prompt here.

00:18:24.788 --> 00:18:27.188
And then here is basically the same thing.

00:18:27.188 --> 00:18:28.388
We haven't changed much.

00:18:28.398 --> 00:18:28.768
we've,

00:18:28.768 --> 00:18:29.918
we've made this

00:18:30.092 --> 00:18:30.332
the,

00:18:30.332 --> 00:18:32.532
the enum types and the definition here.

00:18:32.532 --> 00:18:33.332
And the reason

00:18:34.402 --> 00:18:35.762
description is all kind of the same.

00:18:36.002 --> 00:18:38.322
And we're passing this into our

00:18:39.702 --> 00:18:40.642
generate object,

00:18:41.022 --> 00:18:42.782
to our generate object prompt.

00:18:43.502 --> 00:18:44.382
and then we're also

00:18:44.782 --> 00:18:46.382
modify or passing it into

00:18:46.862 --> 00:18:47.182
the

00:18:47.182 --> 00:18:49.446
into the schema inside of this

00:18:50.006 --> 00:18:52.246
generate object from the AI SDK.

00:18:52.246 --> 00:18:54.486
Now I do expect this to work

00:18:54.966 --> 00:18:56.726
better just because I have actually played around

00:18:56.726 --> 00:18:57.526
with this a little bit.

00:18:57.606 --> 00:18:59.446
But this is one of the things where

00:19:00.076 --> 00:19:01.116
it's really up to you,

00:19:01.416 --> 00:19:04.256
the user or the creator of an application like

00:19:04.256 --> 00:19:05.536
this to experiment a lot,

00:19:05.536 --> 00:19:08.496
to just figure out exactly what types of prompts

00:19:08.496 --> 00:19:10.536
and what types of capabilities each model can do,

00:19:10.536 --> 00:19:11.296
how much they cost,

00:19:11.296 --> 00:19:12.056
how long they take.

00:19:12.056 --> 00:19:13.896
It's really just a whole bunch of experimentation.

00:19:14.496 --> 00:19:16.576
so I would encourage you to like try different

00:19:16.576 --> 00:19:17.056
models,

00:19:17.056 --> 00:19:18.006
different prompts.

00:19:18.006 --> 00:19:20.116
you can build workflows around like you know,

00:19:20.116 --> 00:19:22.516
AB testing different models and different prompts

00:19:22.516 --> 00:19:22.876
and stuff.

00:19:22.876 --> 00:19:25.356
And then on the back end you can have a whole

00:19:25.356 --> 00:19:27.766
system that kind of like uses a really beefy

00:19:27.766 --> 00:19:29.886
expensive model to kind of sample outputs and

00:19:29.886 --> 00:19:31.006
grade how they did.

00:19:31.006 --> 00:19:33.406
So this is like a lighter weight cheap model.

00:19:33.406 --> 00:19:35.526
But you could technically have an entire like

00:19:35.526 --> 00:19:37.806
backend service that is listening to the outputs,

00:19:37.886 --> 00:19:39.246
doing some batch processing.

00:19:39.246 --> 00:19:39.966
So it's cheaper

00:19:40.686 --> 00:19:40.736
using

00:19:40.866 --> 00:19:42.466
like Beefier models by OpenAI

00:19:42.786 --> 00:19:45.506
to you know like actually grade how,

00:19:45.826 --> 00:19:46.946
how it did or how,

00:19:46.946 --> 00:19:49.106
how like the model output actually performed here.

00:19:49.106 --> 00:19:49.506
So

00:19:49.826 --> 00:19:50.706
this is deployed,

00:19:50.866 --> 00:19:53.026
let's go ahead and head back to our

00:19:53.252 --> 00:19:53.852
our workflow.

00:19:53.852 --> 00:19:56.932
I'm just going to copy the same exact input and I

00:19:56.932 --> 00:19:59.572
am going to trigger a new instance here with that

00:19:59.572 --> 00:20:00.212
same link.

00:20:01.252 --> 00:20:02.292
Now let's see if,

00:20:02.532 --> 00:20:03.042
if the

00:20:03.042 --> 00:20:05.532
output is any different I expect it to still say

00:20:05.532 --> 00:20:05.852
that,

00:20:05.962 --> 00:20:07.082
the product is unavailable,

00:20:07.082 --> 00:20:08.282
but maybe it gives a better,

00:20:08.282 --> 00:20:08.682
more,

00:20:09.442 --> 00:20:11.762
clear explanation as to why it tagged it as

00:20:11.762 --> 00:20:12.289
unavailable.

00:20:12.289 --> 00:20:12.604
All right,

00:20:12.604 --> 00:20:14.604
so it looks like the workflow is running.

00:20:15.294 --> 00:20:17.534
right now it is collecting the webpage,

00:20:17.534 --> 00:20:18.594
so it's scraping that web page.

00:20:18.869 --> 00:20:19.949
So now that this is finished,

00:20:19.949 --> 00:20:21.989
we can go ahead and take a look at that output.

00:20:21.989 --> 00:20:24.709
And what I see here is the status is unknown

00:20:25.029 --> 00:20:27.789
and it says the webpage content does not contain

00:20:27.789 --> 00:20:29.509
any information about the product's availability.

00:20:29.589 --> 00:20:32.669
It appears to be a general AliExpress page.

00:20:32.669 --> 00:20:33.029
So,

00:20:33.199 --> 00:20:34.969
a few different reasons why I think it might not

00:20:34.969 --> 00:20:35.649
have picked up

00:20:35.919 --> 00:20:38.119
the content this time would be one,

00:20:38.119 --> 00:20:38.359
like,

00:20:38.359 --> 00:20:41.199
the status that AliExpress gave back would be like

00:20:41.719 --> 00:20:42.359
kind of a general,

00:20:42.439 --> 00:20:42.839
like,

00:20:43.129 --> 00:20:45.129
rate limited page or 401 or something.

00:20:45.129 --> 00:20:47.049
Just what you're going to notice if you're like

00:20:47.049 --> 00:20:47.809
web scraping.

00:20:49.089 --> 00:20:49.489
You know,

00:20:49.489 --> 00:20:52.129
these providers very well might block those

00:20:52.129 --> 00:20:53.889
requests because they don't want bots doing this

00:20:53.889 --> 00:20:54.369
typically.

00:20:54.939 --> 00:20:55.339
and,

00:20:56.609 --> 00:20:57.409
so if we look here,

00:20:57.409 --> 00:20:57.969
we're going to see,

00:20:57.969 --> 00:20:58.289
okay,

00:20:58.289 --> 00:20:59.649
so the status was actually 200.

00:20:59.809 --> 00:21:02.409
So at this point in time it's very clear on the

00:21:02.409 --> 00:21:04.089
webpage that it says like the product is

00:21:04.089 --> 00:21:04.769
unavailable.

00:21:05.319 --> 00:21:05.599
now,

00:21:05.599 --> 00:21:07.599
right now we don't really have any visibility into

00:21:07.599 --> 00:21:09.679
what the body looks like just because it gets

00:21:09.679 --> 00:21:10.279
truncated,

00:21:10.819 --> 00:21:12.339
in the output viewing here.

00:21:12.579 --> 00:21:13.979
So what we're going to do is we're going to create

00:21:13.979 --> 00:21:15.939
a subsequent step that's going to save

00:21:16.659 --> 00:21:16.979
one,

00:21:16.979 --> 00:21:19.219
the output of this model and then two,

00:21:19.219 --> 00:21:21.699
we're also going to be dumping this data into R2.

00:21:21.859 --> 00:21:23.859
So we're going to take all the HTML data and the

00:21:23.859 --> 00:21:25.379
body data and we're going to stick it in there.

00:21:25.539 --> 00:21:26.189
Just so,

00:21:26.359 --> 00:21:27.319
if we needed to,

00:21:27.319 --> 00:21:28.879
we could build further like,

00:21:28.879 --> 00:21:31.079
data services on top of the data that gets stuffed

00:21:31.079 --> 00:21:32.039
in R2 to like,

00:21:32.039 --> 00:21:32.759
evaluate,

00:21:32.759 --> 00:21:34.159
make sure everything's working as expected.

00:21:34.159 --> 00:21:35.919
And then also for debugging use cases,

00:21:35.919 --> 00:21:36.639
we can see like,

00:21:36.639 --> 00:21:37.039
okay,

00:21:37.039 --> 00:21:38.919
is our browser rendering actually pulling all the

00:21:38.919 --> 00:21:39.639
data that it needs?

00:21:39.639 --> 00:21:39.839
Or,

00:21:39.839 --> 00:21:39.999
like,

00:21:39.999 --> 00:21:41.289
are we actually not rendering

00:21:41.639 --> 00:21:42.999
the text on a web page as expected?

00:21:43.159 --> 00:21:44.799
So let's go ahead and get into like,

00:21:44.799 --> 00:21:46.239
the next few steps of this workflow.

00:21:46.239 --> 00:21:47.439
And this is kind of why workflows are really

00:21:47.439 --> 00:21:47.829
powerful.

00:21:47.829 --> 00:21:49.559
you can build a sequence of things that kind of

00:21:49.559 --> 00:21:51.698
like unlock capabilities for a SaaS production.

