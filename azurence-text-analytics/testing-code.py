import string

import nltk
from nltk.corpus import stopwords
nltk.download('punkt')
from nltk.tokenize import word_tokenize

text = "Nickdfsffdsf to play football, however he is not too fond of tennis."
text_tokens = word_tokenize(text)
tokens_without_sw = [word for word in text_tokens if not word in stopwords.words()]
words = [word for word in tokens_without_sw if word.isalpha()]
# tokens_without_sw.translate(str.maketrans('', '', tokens_without_sw.punctuation))

print(tokens_without_sw)