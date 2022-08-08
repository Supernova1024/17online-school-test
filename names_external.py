# -*- coding: utf-8 -*-
"""
Created on Thu Feb 11 21:34:47 2021

Generate personal names, fictious companies, and personal relations
Assigns gender-appropriate pronouns and possessive pronouns

Updated to calls files in Google Drive on 27 Mar 2021

@author: Brian
"""
import pandas as pd
from random import seed
from random import random
from random import randint
from random import choice
from random import shuffle

def people():
    # generate a random name and assign pronouns based on sex
    # names_url = 'https://drive.google.com/file/d/1c2N3nUTipdcaBGMLWKoX2uXHG8R1CQi3/view?usp=sharing'
    # name_path = 'https://drive.google.com/uc?export=download&id=' + names_url.split('/')[-2]
    name_path = 'seeds/names.csv'
    df_names = pd.read_csv(name_path)
    #input_file = 'names'
    #df_names = pd.read_excel(input_file + '.xlsx')
    
    name_choice = randint(0,len(df_names)-1)
    name = df_names.iloc[name_choice,0] #get name from row
    pron = df_names.iloc[name_choice,1] #get pronoun based on name sex
    poss = df_names.iloc[name_choice,2] #get possessive pronoun based on sex
    return name, pron, poss

def company_name():
    # generate a fictious company
    # comp_url = 'https://drive.google.com/file/d/18yY8q5ReV6CxLDIlWr07esRU5xajfToK/view?usp=sharing'
    # comp_path = 'https://drive.google.com/uc?export=download&id=' + comp_url.split('/')[-2]
    comp_path = 'seeds/companies.csv'
    df_comp = pd.read_csv(comp_path)
    #input_file = 'companies'
    #df_comp = pd.read_excel(input_file + '.xlsx')
    
    comp = randint(0,len(df_comp)-1)
    corp_type = choice([' Company','',', LTD', ' Brothers', ', LLC', ' Enterprises',
                        ' Technology', ' Sales', '\'s Equipment', ' Industries',
                        ' Mining', ' Energy', ' Express', ' United', ', Inc.', ' Corp.'])
    comp_name = df_comp.iloc[comp,0]
    comp_name += corp_type
    pron = 'it'
    poss = "it's"
    return comp_name, pron, poss

def generic_company_name():
    # generate a generic company pronoun or description

    comp_name = choice(['firm','company', 'business', 'partnership', 'agency',
                        'institution', 'organization'])
    #comp_name = df_comp.iloc[comp,0]
    #comp_name += corp_type
    pron = 'it'
    poss = "it's"
    return comp_name, pron, poss

def relations():
    # generate a random relationship and assign pronouns based on sex
    # rel_url = 'https://drive.google.com/file/d/1nmWlAAduWdfdBT9VH1xXz-1i1ASCx1Xv/view?usp=sharing'
    # rel_path = 'https://drive.google.com/uc?export=download&id=' + rel_url.split('/')[-2]
    rel_path = 'seeds/relations.csv'
    df_rel = pd.read_csv(rel_path)
    
    name_choice = randint(0,len(df_rel)-1)
    name = df_rel.iloc[name_choice,0] #get name from row
    pron = df_rel.iloc[name_choice,1] #get pronoun based on name sex
    poss = df_rel.iloc[name_choice,2] #get possessive pronoun based on sex
    return name, pron, poss

def vowel_character(c):
    # selects correct article based on first letter of name
    article = 'a'
    
    # check if a vowel (not including y)
    if c in 'aeiou':
        article = 'an'
    return article

def relation_choice():
    type_rel = choice(['person','generic','company', 'relation'])
    
    if type_rel == 'person':
        name,pron,pos = people()
    if type_rel == 'generic':
        name,pron,pos = generic_company_name()
    if type_rel == 'company':
        name,pron,pos = company_name()
    if type_rel == 'relation':
        name,pron,pos = relations()
        
    return name,pron,pos
        
#print(relation_choice())

'''
comp_name, pron, poss = generic_company_name()
article = vowel_character(comp_name[0])
print(article + ' ' + comp_name)
'''