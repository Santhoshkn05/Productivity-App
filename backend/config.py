class Config:
    SECRET_KEY = "supersecretkey"
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Santhosh%40827@localhost/mydb"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "yoursecretjwtkey"   
    JWT_TOKEN_LOCATION = ["headers"]      
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
