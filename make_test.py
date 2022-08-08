# -*- coding: utf-8 -*-
"""
Created on 21 April 2021
Reads JSON with input test request parameters
Reads JSON with test questions
Converts test questions into datagram and filters out question 
based on test request parameters.
Randomly select questions from filtered list.
Creates JSON to send for display
Added time count (in minutes)
Updated 27 May 2021 to connect to MongoDB
@author: Brian
"""
from random import seed
from random import sample
from random import shuffle
import time
import pandas as pd
import string
import socket
import json
import datetime
import copy
import sys
from pymongo import MongoClient
from bson.objectid import ObjectId
from random import randint

## Load database
# client = MongoClient('mongodb+srv://brian:Gpim3KOtSwkODRKN@erud8.emtfd.mongodb.net/erud8?retryWrites=true&w=majority')
# db=client.erud8

client = MongoClient('localhost', 27017)
db=client.examGround

### Functions
def make_serial(target_crs):
	# generate a test serial number using the course name
	test_request_time = time.time() 
	time_serial = str(int(test_request_time))
	test_serial = (target_crs[0:3] + time_serial[len(time_serial)-5:len(time_serial)]).upper()
	return test_serial

def short_answer_q(q_full,names,values):
	# placeholding function
	return q_full

def short_answer_mc(df_short, sa, names, costs):
	# prepare and shuffle mult-choice answers and identify correct one
	# modify each answer to reflect question variables
	
	answers = [short_answer_q(df_short['Correct'][sa], names, costs),
		   short_answer_q(df_short['Alt_1'][sa], names, costs),
		   short_answer_q(df_short['Alt_2'][sa], names, costs),
		   short_answer_q(df_short['Alt_3'][sa], names, costs),
		   short_answer_q(df_short['Alt_4'][sa], names, costs)]
	
	sequence = [i for i in range(len(answers))]
	shuffle(sequence)
	shuffle(sequence)
	
	new_answers = []
	# find correct answer in shuffled sequence
	for k in range(len(sequence)):
		if sequence[k] == 0:
			correct = k
		new_answers.append(answers[sequence[k]])
		
	return new_answers, correct

def short_answer_tf(df_short, sa, names, costs):
	# prepare Boolean (True/False) answers and identify correct one
	# modify each answer to reflect question variables
	
	answers = [str(df_short['Correct'][sa]), str(not(df_short['Correct'][sa]))]
	
	sequence = [i for i in range(len(answers))]
	shuffle(sequence)
	
   # print(sequence)
	
	new_answers = []
	# find correct answer in shuffled sequence
	for k in range(len(sequence)):

		if sequence[k] == 0:
			correct = k
		new_answers.append(answers[sequence[k]])
		
	return new_answers, correct

def compute_mc(df_short, sa, names, values, units):
	
	## generates multiple choice answers
	answers = [df_short['Correct'][sa],
			   df_short['Alt_1'][sa],
			   df_short['Alt_2'][sa],
			   df_short['Alt_3'][sa],
			   df_short['Alt_4'][sa]] 
	   
	#print(currency(eval(short_answer_q(df_short['Correct'][sa], names, costs))))

	sequence = [i for i in range(len(answers))]
	shuffle(sequence)
	shuffle(sequence)
	
	new_answers = [] # make new list to capture resequenced answers
	
	for k in range(len(sequence)):
		
		# find correct answer in shuffled sequence
		if sequence[k] == 0:
			correct = k
		
		# append new re-sequenced answers
		new_answers.append(answers[sequence[k]])
			
	return new_answers, correct

def compute_tf(df_short, sa, names, values, unit):
	
	## generates Boolean (True/False) answers based on evaluation of equation
	## make true/false answers
	answers = [df_short['Correct'][sa], df_short['Alt_1'][sa]]

	sequence = [i for i in range(len(answers))]
	shuffle(sequence)
	
	new_answers = [] # make new list to capture resequenced answers
	
	# print(sequence)
	for k in range(len(sequence)):
		
		# find correct answer in shuffled sequence
		if sequence[k] == 0:
			correct = k
		
		# append new re-sequenced answers
		new_answers.append(answers[sequence[k]])
			
	return new_answers, correct

def main():
	# make list of upper case characters A, B, C, D...
	char_list = list(string.ascii_uppercase)

	# load test request parameters
	testparam_id = sys.argv[1]
	tp_result = db.testparams.find_one({"_id": ObjectId(testparam_id)})  ## call database collection into dataframe
	test_request = tp_result['values']
	# test_request = json.load(open(sys.argv[1])) ### uncommment when using in server
	# test_request = json.load(open('test_parameters3.json'))  ### uncomment when using to test
	course = test_request['course']
	chapters = list(test_request['chapters'].keys())

	# load test questions and make into a dataframe
	questions = db.devtestquestions.find()
	df_q = pd.DataFrame(questions)

	print ('df_q',  df_q)
	# select only questions within the desired course
	df_q = df_q.loc[df_q['Course']==course]
	df_q = df_q.reset_index(drop = True).sort_values(by=['Chapter', 'TOPIC_KEY'])

	test_summary = [] # this will be a list of dictionaries with summarized parameters

	for chap in chapters:
		
		# prepare for individual topics
		df_topics = pd.DataFrame()
		topics = list(test_request['chapters'][chap].keys())
		
		# get individual chapters
		dftemp2 = df_q.loc[df_q['Chapter_Name']==chap]
		
		###  extract questions based on topics
		for top in topics:
			df_topics2 = dftemp2.loc[dftemp2['Topic']==top]
			
			# add questions by topic
			df_topics = pd.concat((df_topics, df_topics2), axis = 0)
			
			for key in test_request['chapters'][chap][top]:
				
				# make summary dictionary if parameters n > 0

				if test_request['chapters'][chap][top][key]['selectednum'] > 0:
					qu_params = key.split('-') # make 'SAQ-SA-Hard' -> ['SAQ', 'SA', 'Hard']
					
					## replace shortened text with extended tex   
					if qu_params[2] == 'Med':
						qu_params[2] = 'Medium'
					
					# make temp dictionary fpr each topic and parameter n > 0
					temp_dict = {
						   'chapter':chap,
						   'topic':top, 
						   'QTYPE':qu_params[0],
						   'Type': qu_params[1],  
						   'Difficulty': qu_params[2],
						   'qty':test_request['chapters'][chap][top][key]['selectednum'],
						   'credit':test_request['chapters'][chap][top][key]['selectednum']			  
						   }
					
					# add temp dictionary to test summary list
					test_summary.append(temp_dict)
		
	############################################################
	### Build test

	# generate a test serial number using the first unique subject
	test_serial = make_serial(test_request['subject'])
	# print('Test ' + test_serial + '\n')

	#initialize test dictionary
	dict_test = {'serial':test_serial, 
				 'test_name':test_request['test_name'],
				 'student_machine':socket.gethostbyaddr(socket.gethostname())[0],
				 'area':test_request['area'],
				 'subject':test_request['subject'],
				 'course':test_request['course'],
				 'language':test_request['language'],
				 'request_serial':test_request['request_serial'],
				 'created':datetime.datetime.now().isoformat()}

	dict_test_q = copy.deepcopy(dict_test)
	dict_test_q['questions']=''

	dict_test_ans = copy.deepcopy(dict_test)
	dict_test_ans['answers']=''

	# initiate dataframe that will contain the test questions and answers
	df_test = pd.DataFrame()

	## select random questions based on required type and difficulty
	#### begin test generation loop
	temp_dict_q = {}
	temp_dict_a ={}

	names_r = 1
	costs_r = 1

	tot_count = 0
	j = 0 ## counter

	for qcat in test_summary:
		df_short = df_q.loc[(df_q['Chapter_Name'] == qcat['chapter']) & 
							(df_q['Topic'] == qcat['topic']) & 
							(df_q['QTYPE'] == qcat['QTYPE']) &
							(df_q['Type'] == qcat['Type']) &
							(df_q['Difficulty'] == qcat['Difficulty'])
							].reset_index(drop = True)
		
		# count total number of questions
		tot_count += qcat['qty']
		
		# print(qcat['topic'],qcat['QTYPE'], qcat['Type'], qcat['Difficulty'],len(df_short), qcat['qty'])
		
		# make list of random question indices (non-repeating) based on the total # of desired questions
		sa = sample(range(len(df_short)), k = qcat['qty'])
		for i in sa:
			temp_dict = df_short.iloc[2].to_dict()
			
			# make question and answers from master question list
			q_full = short_answer_q(df_short['Question'][i], names_r, costs_r)
			
			# capture question credit
			diff = qcat['Difficulty']
			if qcat['Difficulty'] == 'Medium':
				diff = 'Med'
			cr_sample = test_request['chapters'][qcat['chapter']][qcat['topic']][qcat['QTYPE']+'-'+qcat['Type']+'-'+diff]['cr']
			

			#-------------------------------------------- for Multiple Choice Questions
			if df_short['QTYPE'][i] == 'MCQ':
				if df_short['Type'][i] == 'SA':
					answers, correct = short_answer_mc(df_short, i, names_r, costs_r)
					
				if df_short['Type'][i] == 'Comp':
					uom = df_short['Units'][i]
					answers, correct = compute_mc(df_short, i, names_r, costs_r, uom)
				
				#print(i+1,q_full)

				temp_ans = {}
				for n in range(len(answers)):
					#print(char_list[n] + '. ' + answers[n])
					temp_ans[char_list[n]] = answers[n]
					
				#print('\nCorrect answer is ' + char_list[correct])
				
				############# make dictionaries for questions and answers  
				dict_ques_temp = {'chapter':df_short['Chapter_Name'][i],
					 'pkey':int(df_short['PKEY'][i]),
					 'topic_key': int(df_short['TOPIC_KEY'][i]),
					 'question_order': i+1,
					 'qtype':df_short['QTYPE'][i],
					 'type': df_short['Type'][i],
					 'difficulty':df_short['Difficulty'][i],
					 'question': q_full,
					 'credit':cr_sample,
                 'time': int(df_short['Time'][i]),
					 'responses':temp_ans}
				
				temp_dict_q['Q'+str(i)] = dict_ques_temp
				
			   
				dict_ans_temp = {'chapter':df_short['Chapter_Name'][i],
							 'pkey':int(df_short['PKEY'][i]),
							 'topic_key':int(df_short['TOPIC_KEY'][i]),
							 'question_order': i+1,
							 'qtype':df_short['QTYPE'][i],
							 'type': df_short['Type'][i],
							 'difficulty':df_short['Difficulty'][i],
							 'correct':char_list[correct],
							 'credit':cr_sample}
				
				temp_dict_a['A'+str(i)] = dict_ans_temp
					
		#--------------------------------------- for Boolean (True/False) questions
			if df_short['QTYPE'][i] == 'TFQ':
			
				if df_short['Type'][i] == 'Short':
					answers, correct = short_answer_tf(df_short, i, names_r, costs_r)
					
				if df_short['Type'][i] == 'Comp':
					uom = df_short['Units'][i]
					answers, correct = compute_tf(df_short, i, names_r, costs_r, uom)
				
				#print(i+1,q_full)
				
				temp_ans = {}
				for n in range(len(answers)):
					#print(char_list[n] + '. ' + answers[n])
					temp_ans[char_list[n]] = answers[n]
					
				#print('\nCorrect answer is ' + char_list[correct])
				#print('\n')
				
			############# make dictionaries for questions and answers  
			dict_ques_temp = {'chapter':df_short['Chapter_Name'][i],
						 'pkey':int(df_short['PKEY'][i]),
						 'topic_key': int(df_short['TOPIC_KEY'][i]),
						 'question_order': i+1,
						 'qtype':df_short['QTYPE'][i],
						 'type': df_short['Type'][i],
						 'difficulty':df_short['Difficulty'][i],
						 'question': q_full,
						 'credit':cr_sample,
                    'time': int(df_short['Time'][i]),
						 'responses':temp_ans}
			
			temp_dict_q['Q'+str(j)] = dict_ques_temp
			
			dict_ans_temp = {'chapter':df_short['Chapter_Name'][i],
						 'pkey':int(df_short['PKEY'][i]),
						 'topic_key':int(df_short['TOPIC_KEY'][i]),
						 'question_order': i+1,
						 'qtype':df_short['QTYPE'][i],
						 'type': df_short['Type'][i],
						 'difficulty':df_short['Difficulty'][i],
						 'credit':cr_sample,
						 'correct':char_list[correct]}
			
			temp_dict_a['A'+str(j)] = dict_ans_temp
			
			j += 1
			

	# print('\nTotal Questions =', tot_count)  
			  
	dict_test_q['questions']= temp_dict_q
	dict_test_ans['answers']= temp_dict_a
			
	result_ques = db.testquestions.insert_one(dict_test_q)
	result_ans = db.testanswers.insert_one(dict_test_ans)
	result = '{"question": "' + str(result_ques.inserted_id) +'", "answer": "' + str(result_ans.inserted_id) + '"}'

	print (result)
	sys.stdout.flush()

if __name__ == '__main__':
	main()
