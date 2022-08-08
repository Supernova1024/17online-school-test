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
Updated 29 May to include erud8_lib2 calls
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
import erud8_lib2 as e8
from pymongo import MongoClient
from bson.objectid import ObjectId
from random import randint

#''' uncomment when uploaded
## Load database
# client = MongoClient('mongodb+srv://brian:Gpim3KOtSwkODRKN@erud8.emtfd.mongodb.net/erud8?retryWrites=true&w=majority')
# db=client.erud8

client = MongoClient('localhost', 27017)
db=client.examGround
#'''

### Functions
def make_serial(target_crs):
	# generate a test serial number using the course name
	
	#return test_serial
	return e8.make_serial(target_crs)

def short_answer_q(q_full,names,values):
	# placeholding function
	
	#return q_full
	return e8.short_answer_q(q_full,names,values)

def short_answer_mc(df_short, sa, names, costs):
	# prepare and shuffle mult-choice answers and identify correct one
	# modify each answer to reflect question variables
		
	#return new_answers, correct
	return e8.short_answer_mc(df_short, sa, names, costs)

def short_answer_tf(df_short, sa, names, costs):
	# prepare Boolean (True/False) answers and identify correct one
	# modify each answer to reflect question variables
		
	#return new_answers, correct
	return e8.short_answer_tf(df_short, sa, names, costs)

def compute_mc(df_short, sa, names, values, units):
	
	## generates multiple choice answers

	return e8.compute_mc(df_short, sa, names, values, units)

def compute_tf(df_short, sa, names, values, unit):
	
	## generates Boolean (True/False) answers based on evaluation of equation
	## make true/false answers
			
	#return new_answers, correct
	return compute_tf(df_short, sa, names, values, unit)

def main():
	# make list of upper case characters A, B, C, D...
	char_list = list(string.ascii_uppercase)
	
	seed(e8.make_seed())

	# load test request parameters
	#uncomment when uploaded
	testparam_id = sys.argv[1]
	tp_result = db.testparams.find_one({"_id": ObjectId(testparam_id)})  ## call database collection into dataframe
	
	# choose which questions database to use and pull chapters into new variable
	choose_db = tp_result['database']
	test_request = tp_result['values']

	## load a test request parameters
	course = test_request['course']
	chapters = list(test_request['chapters'].keys())

	# load test questions and make into a dataframe  
	if choose_db == "dev":
		collection = db.devtestquestions
		mongo_cursor = collection.find() # select all
		df_q = pd.DataFrame(mongo_cursor)

	if choose_db == "act":
		collection = db.acttestquestions  ### <---- RENAME to whatever the proper collection is!!!!!!!!!!!!!!
		mongo_cursor = collection.find() # select all
		df_q = pd.DataFrame(mongo_cursor)

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
			names_r = e8.random_names()
			costs_r = e8.random_values()
			
			temp_dict = df_short.iloc[i].to_dict()
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
				
				temp_dict_q['Q'+str(j)] = dict_ques_temp
				
			   
				dict_ans_temp = {'chapter':df_short['Chapter_Name'][i],
							 'pkey':int(df_short['PKEY'][i]),
							 'topic_key':int(df_short['TOPIC_KEY'][i]),
							 'question_order': i+1,
							 'qtype':df_short['QTYPE'][i],
							 'type': df_short['Type'][i],
							 'difficulty':df_short['Difficulty'][i],
							 'correct':char_list[correct],
							 'credit':cr_sample}
				
				temp_dict_a['A'+str(j)] = dict_ans_temp
					
		#--------------------------------------- for Boolean (True/False) questions
			if df_short['QTYPE'][i] == 'TFQ':
			
				if df_short['Type'][i] == 'SA':
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
