const Sequelize = require('sequelize');
var sequelize = new Sequelize('db88flqbpkgesn','hbxwfdppsicfco','aec36f6024ae9cb6f978b3856e99fd7365f15a2eeb7d04224b0f28111364cf0c',{
    host:'ec2-54-80-122-11.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl:{rejectUnauthorized:false}
    },
    query:{raw:true}
});


// define a data models
var Post = sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category',{
    category: Sequelize.STRING
})

// Create the relationship 
Post.belongsTo(Category,{foreignKey:'category'});


module.exports.initialize = function () {
    return new Promise((resolve, reject)=>{
        resolve(sequelize.sync()
        .then(()=>{console.log("Connect successful")})
        .catch(()=>{reject('unable to sync the database')})
        ); 
    })
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll().then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject('no results returned');
        })
    });
}

module.exports.getPostsByCategory = function(pCategory){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                category: pCategory
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject('no results returned')
        })
    });
}

module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        const {gte} = Sequelize.Op;
        Post.findAll({
            where:{
                postDate:{
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data=>{
            resolve(data);
        })).catch(()=>{
            reject('no results returned')
        })
    });
}

module.exports.getPostById = function(pId){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id: pId
            }
        }).then((data)=>{
            resolve(data[0]); 
        }).catch(()=>{
            reject('no result returned');
        })
    });
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published)?true: false;
        for (const property in postData){
            if(postData[property] =="")
                postData[property]= null;
        }
        postData.postDate = new Date();
        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: postData.postDate,
            featureImage: postData.featureImage,
            published: postData.published?true:false,
            category:postData.category
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject('unable to create post');
        })
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve,reject)=>{
        for(const property in categoryData){
            if(categoryData[property]==""){
                categoryData[property]= null;
            }
        }
        Category.create({
            category: categoryData.category
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("unable to create category");
        })
    })
}

module.exports.deleteCategoryById = function(pId){
    return new Promise((resolve,reject)=>{
        Category.destroy({
            where:{id:pId}
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject(err);
        })
    })
}

module.exports.deletePostById = function(pId){
    return new Promise((resolve,reject)=>{
        Post.destroy({
            where:{id:pId}
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject(err);
        })
    })
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published:true
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject('no results returned');
        })
    });
}

module.exports.getPublishedPostsByCategory = function(pCategory){
    return new Promise((resolve, reject) => {
       Post.findAll({
            where:{
                published:true,
                category: pCategory
            }
       }).then((data)=>{
        resolve(data);
       }).catch(()=>{
        reject('no results returned');
       })
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll().
        then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject('no results returned');
        })
    });
}