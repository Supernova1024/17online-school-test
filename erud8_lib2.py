# -*- coding: utf-8 -*-
"""
Created on 31 Mar 2021

Library of main functions using dictionaries

@author: Brian
"""
from random import seed
from random import uniform
from random import randint
from random import shuffle
import names_external as names  #function to get name and pronouns for text string
import time
import babel.numbers
from iteration_utilities import duplicates

def make_seed():
    #### generate random seed
    t = int( time.time() * 1000.0 )
    t = (((t & 0xff000000) >> 24) +
                 ((t & 0x00ff0000) >>  8) +
                 ((t & 0x0000ff00) <<  8) +
                 ((t & 0x000000ff) << 24))  
    seed(t)
    return t

def make_serial(target_crs):
    # generate a test serial number using the course name
    test_request_time = time.time() 
    time_serial = str(int(test_request_time))
    test_serial = (target_crs[0:3] + time_serial[len(time_serial)-5:len(time_serial)]).upper()
    return test_serial

def currency(value, set_currency = 'USD'):
    
    # use only USD for now
    if set_currency == 'USD':
        value = babel.numbers.format_currency(value, "USD", locale="en_US")
       
    return value

def random_names():
    # make list of names and pronouns 0 = name, 1 = pronoun, 2 = poss pronoun
    name_dict = {'name_1': names.people(),
             'name_2': names.people(),
             'name_3': names.people(),
             'relation_1': names.relations(),
             'company_1': names.company_name(),
             'generic_comp_1': names.generic_company_name()}
    return name_dict

def value_sort(a, flag = False):
    ## sorts list of values and sees if a value is duplicated 
    ## if duplicated, updates dupes_flag
    
    a.sort(reverse = flag)
    dupes_flag = len(list(duplicates(a))) # hopefully 0
    return a, dupes_flag

def random_values():
    dupes = 1
    
    ## loops as long as it thinks there is a duplicate in a list
    ## assumes dupes has duplicates until set to 0
    
    while dupes > 0:
        
        dupes = 0
        
        # make list of costs (3 different ones per type)
        micro_cost, du = value_sort([randint(10,900) * 10, 
                                    randint(10,900) * 10, 
                                    randint(10,900) * 10, 
                                    randint(10,900) * 10, 
                                    randint(10,900) * 10, 
                                    randint(10,900) * 10], False)
        dupes += du
        
        #### make mid-range costs
        mid_cost, du = value_sort([randint(100,900) * 100, 
                              randint(100,900) * 100, 
                              randint(100,900) * 100,
                              randint(100,900) * 100,
                              randint(100,900) * 100,
                              randint(100,900) * 100], False)
        dupes += du
        
        # make large costs
        macro_cost, du = value_sort([randint(1000,2000) * 1000, 
                                    randint(100,900) * 1000, 
                                    randint(100,200) * 1000, 
                                    randint(100,900) * 1000, 
                                    randint(100,900) * 1000, 
                                    randint(100,900) * 1000], True)
        dupes += du
        
        # interest3 is for high value percentages (50-100%)
        interest, du = value_sort([round(uniform(.01,.2) * 100,1), 
                                  round(uniform(.01,.2) * 100,1), 
                                  randint(50,100)], False)
        dupes += du
        
        # make years
        years,du = value_sort([randint(1,25), 
                              randint(1,25), 
                              randint(20,100)], False)
        dupes += du
        
    # sorting goes smallest to largest, unless reverse = True
    
    # make dictionary of values
    values = {'micro_costs':micro_cost, 'mid_costs': mid_cost, 
              'macro_costs': macro_cost, 'years':years, 'interest':interest}
    
    return values   

def short_answer_q(q,names,values):
    
    # put variables into the string
    q_full = str(q.format(
        name1 = names['name_1'][0], pron1 = names['name_1'][1], poss1 = names['name_1'][2],
        name2 = names['name_2'][0], pron2 = names['name_2'][1], poss2 = names['name_2'][2],
        name3 = names['name_3'][0], pron3 = names['name_3'][1], poss3 = names['name_3'][2],
        relation1 = names['relation_1'][0], pronr1 = names['relation_1'][1], possr1 = names['relation_1'][2],
        company1 = names['company_1'][0], pronc1 = names['company_1'][1], possc1 = names['company_1'][2],
        gencomp1 = names['generic_comp_1'][0], prong1 = names['generic_comp_1'][1], possg1 = names['generic_comp_1'][2],
        
        ucost1 = currency(values['micro_costs'][0]),
        cost1 = currency(values['mid_costs'][0]),
        mcost1 = currency(values['macro_costs'][0]),
        years1 = values['years'][0],
        interest1 = str(values['interest'][0]) + '%',
        
        ucost2 = currency(values['micro_costs'][1]),
        cost2 = currency(values['mid_costs'][1]),
        mcost2 = currency(values['macro_costs'][1]),
        years2 = values['years'][1],
        interest2 = str(values['interest'][1]) + '%',
        
        ucost3 = currency(values['micro_costs'][2]),
        cost3 = currency(values['mid_costs'][2]),
        mcost3 = currency(values['macro_costs'][2]),
        years3 = values['years'][2],
        interest3 = str(values['interest'][2]) + '%',
        
        ucost4 = currency(values['micro_costs'][3]),
        ucost5 = currency(values['micro_costs'][4]),
        ucost6 = currency(values['micro_costs'][5]),
        
        cost4 = currency(values['mid_costs'][3]),
        cost5 = currency(values['mid_costs'][4]),
        cost6 = currency(values['mid_costs'][5]),
        
        mcost4 = currency(values['macro_costs'][3]),
        mcost5 = currency(values['macro_costs'][4]),
        mcost6 = currency(values['macro_costs'][5])
        ))
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

def compute_mc(df_short, sa, names, values, units):
    
    ## generates multiple choice answers
    
    # set unit of measure
    uom = units
    
    ## assign variables from the same random variables used in the question
    name1 = names['name_1'][0]; pron1 = names['name_1'][1]; poss1 = names['name_1'][2];
    name2 = names['name_2'][0]; pron2 = names['name_2'][1]; poss2 = names['name_2'][2];
    name3 = names['name_3'][0]; pron3 = names['name_3'][1]; poss3 = names['name_3'][2];
    relation1 = names['relation_1'][0]; pronr1 = names['relation_1'][1]; possr1 = names['relation_1'][2];
    company1 = names['company_1'][0]; pronc1 = names['company_1'][1]; possc1 = names['company_1'][2];
    gencomp1 = names['generic_comp_1'][0]; prong1 = names['generic_comp_1'][1]; possg1 = names['generic_comp_1'][2];
    
    ucost1 = values['micro_costs'][0] 
    cost1 = values['mid_costs'][0] 
    mcost1 = values['macro_costs'][0] 
    years1 = values['years'][0] 
    interest1 = values['interest'][0]
    
    ucost2 = values['micro_costs'][1] 
    cost2 = values['mid_costs'][1] 
    mcost2 = values['macro_costs'][1] 
    years2 = values['years'][1] 
    interest2 = values['interest'][1]
    
    ucost3 = values['micro_costs'][2] 
    cost3 = values['mid_costs'][2] 
    mcost3 = values['macro_costs'][2] 
    years3 = values['years'][2] 
    interest3 = values['interest'][2]
    
    ucost4 = values['micro_costs'][3] 
    ucost5 = values['micro_costs'][4] 
    ucost6 = values['micro_costs'][5] 
    
    cost4 = values['mid_costs'][3] 
    cost5 = values['mid_costs'][4] 
    cost6 = values['mid_costs'][5] 
    
    mcost4 = values['macro_costs'][3] 
    mcost5 = values['macro_costs'][4] 
    mcost6 = values['macro_costs'][5]

    # calculate answers and convert to currency
    if uom == "Currency":
        answers = [currency(eval(df_short['Correct'][sa])),
           currency(eval(df_short['Alt_1'][sa])),
           currency(eval(df_short['Alt_2'][sa])),
           currency(eval(df_short['Alt_3'][sa])),
           currency(eval(df_short['Alt_4'][sa]))]
        
    if uom == "na":
        answers = [str(round(eval(df_short['Correct'][sa]),1)),
           str(round(eval(df_short['Alt_1'][sa]),1)),
           str(round(eval(df_short['Alt_2'][sa]),1)),
           str(round(eval(df_short['Alt_3'][sa]),1)),
           str(round(eval(df_short['Alt_4'][sa]),1))] 
    
    if uom != "na" and uom != "Currency":
        answers = [str(round(eval(df_short['Correct'][sa]),1)) + ' ' + uom,
           str(round(eval(df_short['Alt_1'][sa]),1)) + ' ' + uom,
           str(round(eval(df_short['Alt_2'][sa]),1)) + ' ' + uom,
           str(round(eval(df_short['Alt_3'][sa]),1)) + ' ' + uom,
           str(round(eval(df_short['Alt_4'][sa]),1)) + ' ' + uom]
        
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

def compute_tf(df_short, sa, names, values, unit):
    
    ## generates Boolean (True/False) answers based on evaluation of equation
    
    ## assign variables from the same random variables used in the question
    name1 = names['name_1'][0]; pron1 = names['name_1'][1]; poss1 = names['name_1'][2];
    name2 = names['name_2'][0]; pron2 = names['name_2'][1]; poss2 = names['name_2'][2];
    name3 = names['name_3'][0]; pron3 = names['name_3'][1]; poss3 = names['name_3'][2];
    relation1 = names['relation_1'][0]; pronr1 = names['relation_1'][1]; possr1 = names['relation_1'][2];
    company1 = names['company_1'][0]; pronc1 = names['company_1'][1]; possc1 = names['company_1'][2];
    gencomp1 = names['generic_comp_1'][0]; prong1 = names['generic_comp_1'][1]; possg1 = names['generic_comp_1'][2];
    
    ucost1 = values['micro_costs'][0] 
    cost1 = values['mid_costs'][0] 
    mcost1 = values['macro_costs'][0] 
    years1 = values['years'][0] 
    interest1 = values['interest'][0]
    
    ucost2 = values['micro_costs'][1] 
    cost2 = values['mid_costs'][1] 
    mcost2 = values['macro_costs'][1] 
    years2 = values['years'][1] 
    interest2 = values['interest'][1]
    
    ucost3 = values['micro_costs'][2] 
    cost3 = values['mid_costs'][2] 
    mcost3 = values['macro_costs'][2] 
    years3 = values['years'][2] 
    interest3 = values['interest'][2]
    
    ucost4 = values['micro_costs'][3] 
    ucost5 = values['micro_costs'][4] 
    ucost6 = values['micro_costs'][5] 
    
    cost4 = values['mid_costs'][3] 
    cost5 = values['mid_costs'][4] 
    cost6 = values['mid_costs'][5] 
    
    mcost4 = values['macro_costs'][3] 
    mcost5 = values['macro_costs'][4] 
    mcost6 = values['macro_costs'][5]

    ## make true/false answers
    answers = [str(eval(df_short['Correct'][sa])), str(not(eval(df_short['Correct'][sa])))]

    sequence = [i for i in range(len(answers))]
    shuffle(sequence)
    
    new_answers = [] # make new list to capture resequenced answers
    
    print(sequence)
    for k in range(len(sequence)):
        
        # find correct answer in shuffled sequence
        if sequence[k] == 0:
            correct = k
        
        # append new re-sequenced answers
        new_answers.append(answers[sequence[k]])
            
    return new_answers, correct

