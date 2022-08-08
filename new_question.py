# -*- coding: utf-8 -*-
"""
Created on Mon May 31 21:02:05 2021
Generate an MCQ question with 5 responses and display it with random variables


@author: Brian
"""
from random import seed
import pandas as pd
import string
import erud8_lib2 as e8


# ----------------------------------------
# ----- Main program ---------------------
# ----------------------------------------
def main():
    
    seed(e8.make_seed())
    
    new_question = {}
    
    # make list of upper case characters A, B, C, D...
    char_list = list(string.ascii_uppercase)
    #get randomized data
    names_r = e8.random_names()
    values_r = e8.random_values()
    
    ## get text inputs for question and responses
    question = input('Type Multiple Choice Question Text with variable formats: ')
    correct = input('Type correct response answer/formula: ')
    alt_1 = input('Type alternative response 1 answer/formula: ')
    alt_2 = input('Type alternative response 2 answer/formula: ')
    alt_3 = input('Type alternative response 3 answer/formula: ')
    alt_4 = input('Type alternative response 4 answer/formula: ')
    uom = input('What are the output units? (Currency, percentage, or na): ')
    
    ## prepare question with random variables
    temp_question = e8.short_answer_q(question, names_r, values_r)
    
    ## prepare response with random variables
    df_responses = pd.DataFrame([correct, alt_1, alt_2, alt_3, alt_4]).T
    df_responses.columns = ['Correct', 'Alt_1', 'Alt_2', 'Alt_3', 'Alt_4']
    answers, correct = e8.compute_mc(df_responses, 0, names_r, values_r, 'Currency')
    
    ## make JSON of question and responses
    temp_ans = {}
    
    print('\n'+temp_question)
    
    for n in range(len(answers)):
        print(char_list[n] + '. ' + answers[n])
        temp_ans[char_list[n]] = answers[n]
    
    new_question = {'question': temp_question,
                    'responses': temp_ans,
                    'qtype': 'MCQ',
                    'language':'Englush',
                    'type': 'Comp'}
    ### Need to add metadata associated with other questions
    ### Difficulty, topic, subject, area, date/time created, author name
    ## course, language, serial (not pkey yet) - if approved, add pkey and topic_key
    
    print('\nCorrect answer is ' + char_list[correct])

if __name__ == '__main__':
	main()
