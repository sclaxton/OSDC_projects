from horizon.templatetags import sizeformat
import values_module

class Cloud:
    def __init__(self, name):
        self.name = name
    
class StorageCloud(Cloud):
    def __init__(self, name, storage_values):
        super(StorageCloud, self).__init__(self, name)
        self.storageValues = storage_values 
        
class GenPurpCloud(StorageCloud):
    def __init__(self, name, storage_values, user_values, 
                 instance_values, core_values, ram_values, instor_values):
        super(GenPurpCloud, self).(self, )

