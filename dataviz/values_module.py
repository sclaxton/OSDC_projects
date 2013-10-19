class Values:
    @staticmethod   
    def percent_form(x):
        return '{:.1%}'.format(x)
    def __init__(self,curr_val, max_val, curr_update, max_update):
        self.currVal = curr_val
        self.maxVal = max_val
        self.percent = self.percent_form(curr_val / max_val) 
        self.currUpdate = curr_update
        self.maxUpdate = max_update
    def update(self):
        self.currVal = self.currUpdate 
        self.maxVal = self.maxUpdate

class StorageValues(Values):
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(StorageValues, self).__init__(self, curr_val, max_val, curr_update, max_update)
        self.currUnits = sizeformat.diskgbformat(curr_val)
        self.maxUnits = sizeformat.diskgbformat(max_val)
       
class UserValues(Values):
    unit = " Users"
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(StorageValues, self).__init__(self, curr_val, max_val, curr_update, max_update)
        self.currUnits = str(curr_val) + self.unit 
        self.maxUnits = str(max_val) + self.unit

class CoreValues(UserValues):
    unit = " Cores"
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(CoreValues, self).__init__(self, curr_val, max_val, curr_update, max_update)
        
class JobValues(UserValues):
    unit = " Jobs"
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(JobValues, self).__init__(self, curr_val, max_val, curr_update, max_update)

class InstanceValues(UserValues):
    unit = " VM Instances"
    def __init__(self, curr_val, max_val, curr_update, max_update):
        super(InstanceValues, self).__init__(self, curr_val, max_val, curr_update, max_update)
