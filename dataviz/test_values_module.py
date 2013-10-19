import unittest
import os, sys
from values import Values 
from values import StorageValues
sys.path.append('/Users/spencerclaxton/OSDC_projects/dataviz/')
os.environ.setdefault("DJANGO_SETTINGS_MODULE",                                                           
                      "openstack_dashboard.settings")      

class TestValues(unittest.TestCase):
    values1 = Values(0, 0, None, None)
    values2 = Values(1.1212, 2413.3243, None, None)
    def testValuesHasAttrs(self): 
        assert isinstance(values1.currVal, (int, long, float, complex)), "no currVal!"
        assert isinstance(values1.currVal, (int, long, float, complex)), "no maxVal!"
        assert isinstance (values2.percent, str), "not formatted correctly"
        assert values1.percent is "undefined", "divided by 0!"
        values1.update()
        assert values1.currVal == None, "update currVal failed" 
        assert values1.maxVal == None, "update maxVal failed" 

class TestStorageValues(unittest.TestCase):
    stroage_value = StorageValues(0, 0, None, None)
    def testInherit(self):
        assert isinstance(storage_value, Values), "inheritance broke!"


if __name__=="__main__":
    unittest.main()
