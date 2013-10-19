(function() {
    var callback = function () {
        JSON = (function () {
            var json = null
            $j.ajax({
                'async': false,
                'global': false,
                'url': '',
                'dataType': 'json',
              //  'mimeType': 'application/json',
                'success': function (data) { 
                    json = data
                }
            })
            return json
        })()
    }
    callback()
    setInterval(callback, 30000) 
})()



function Cloud (name) {
    this.name = name;
    this.time = "none";
};

Cloud.prototype.updateTime = function () {
    var time = getUpdateTime(this.name); 
    this.time = time;
}

function StorageCloud (name) {
    Cloud.call(this, name);
    // add specific cloud properties here
}

function StorageCloud = Object.create(Cloud.prototype)

StorageCloud.prototype.type = "storageCloud"

function ComputeCloud (name) {
    Cloud.call(this, name);
    // add specific cloud properties here
}

function ComputeCloud = Object.create(Cloud.prototype)

ComputeCloud.prototype.type = "storageCloud"

function HdfsCloud (name) {
    Cloud.call(this, name);
    // add specific cloud properties here
}

function HdfsCloud = Object.create(Cloud.prototype)

HdfsCloud.prototype.type = "storageCloud"
    
