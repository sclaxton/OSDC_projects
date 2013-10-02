from horizon.templatetags import sizeformat

class Values(object):                                                                            
    @staticmethod                                                                        
    def percent_form(x):                                                                 
        return '{:.1%}'.format(x)                                                        
    def __init__(self, curr_val, max_val, curr_update, max_update):                       
        self.currVal = curr_val                                                          
        self.maxVal = max_val
        self.percent =  self.percent_form(curr_val / max_val) if max_val != 0 else "undefined"               
        self.currUpdate = curr_update       
        self.maxUpdate = max_update   
    def update(self):                                                                    
        self.currVal = self.currUpdate                                                   
        self.maxVal = self.maxUpdate 

class StorageValues(Values):
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(StorageValues, self).__init__(curr_val, max_val, curr_update, max_update)
        self.currUnits = sizeformat.diskgbformat(curr_val)
        self.maxUnits = sizeformat.diskgbformat(max_val)
