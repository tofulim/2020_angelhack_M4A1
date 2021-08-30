# 2020_angelhack_M4A1
2020엔젤핵 해커톤 M4A1팀의 제출용 repository입니다. 

## Project명 :  착한 선결제 ( 주제 中 "테이블 매니저" 선정)
- 소상공인과 사용자들을 편리하게 이어주어 상부상조하기 위함


## 프로젝트 정보
  ### 1. 설치 (앱의 설치 & 서버 구동 시 필요한 모듈 설명)
   #### 프론트 파트   
   - front 알집 안에 있는 apk 파일을 안드로이드에 넣고 실행시키면 됩니다.
   - Project 수준에서 필요한 gradle
buildscript {
    ext.kotlin_version = "1.3.72"
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:4.0.0"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files

    }
}

allprojects {
    repositories {
        google()
        jcenter()
        maven{
            url "https://maven.google.com"
        }
        maven { url 'http://devrepo.kakao.com:8088/nexus/content/groups/public/'}
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}


app 수준에서 필요한 gradle

android {
    compileSdkVersion 29

    defaultConfig {
        applicationId "com.example.garam.angelhack"
        minSdkVersion 26
        targetSdkVersion 29
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        targetCompatibility = "8"
        sourceCompatibility = "8"
    }
    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_1_8.toString()
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
    implementation 'androidx.core:core-ktx:1.3.0'
    implementation 'androidx.appcompat:appcompat:1.1.0'
    implementation group: project.KAKAO_SDK_GROUP, name: 'usermgmt', version: project.KAKAO_SDK_VERSION
    implementation group: project.KAKAO_SDK_GROUP, name: 'kakaotalk', version: project.KAKAO_SDK_VERSION
    implementation 'com.squareup.okhttp3:okhttp:3.13.1'
    implementation 'androidmads.library.qrgenearator:QRGenearator:1.0.4'
    implementation 'com.dlazaro66.qrcodereaderview:qrcodereaderview:2.0.3'
    implementation 'com.github.bumptech.glide:glide:4.10.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.2.1'
    implementation 'com.squareup.retrofit2:retrofit:2.7.0'
    implementation 'com.squareup.retrofit2:retrofit-converters:2.7.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.7.0'
    implementation 'androidx.constraintlayout:constraintlayout:1.1.3'
    implementation 'com.google.android.material:material:1.1.0'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.3.0'
    implementation 'androidx.navigation:navigation-ui-ktx:2.3.0'
    implementation 'androidx.annotation:annotation:1.1.0'
    implementation 'androidx.lifecycle:lifecycle-extensions:2.2.0'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'androidx.test.ext:junit:1.1.1'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.2.0'

}

*** gradle.properties 파일에
KAKAO_SDK_GROUP=com.kakao.sdk
KAKAO_SDK_VERSION=1.30.0
두 줄 추가 해야 합니다.


   #### 백엔드 파트
   - 선결제 금액을 관리하고 가게 점주들과 사용자들의 이해관계에 대한 테이블들만 필요하기 때문에 많은 모듈이 필요하진 않습니다.
   - 사용한 모듈 : 
   "dependencies": {
    "body-parser": "^1.19.0",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "dotenv": "^8.2.0",
    "ejs": "^2.7.4",
    "express": "^4.17.1",
    "express-session": "^1.17.1",
    "http-errors": "~1.6.3",
    "jade": "^1.11.0",
    "morgan": "~1.9.1",
    "multer": "^1.4.2",
    "mysql": "^2.18.1",
    "mysql-server": "^1.0.5",
    "mysql2": "^2.1.0",
    "sequelize": "^6.3.3",
  }
  ### 2. 구현 설명
   #### 프론트 파트  
   먼저 카카오 로그인 sdk를 import해서 카카오 로그인을 실행해 callback 함수로 받은 데이터들을 서버와 다음 액티비티에 전송합니다. 매니저의 경우 manager 패키지를 만들어서 매니저 메뉴와 관련된
액티비티와 클래스들을 모아두었습니다. 결제 리스트와 최근 결제 내역을 조회하기 위해 recyclerview를 이용했으며 생성한 qr코드를 서버에서 조회하기 위해 glide 모듈을 사용했습니다.
qr코드 생성은 QRGenearator 라이브러리를 이용해 구현하였습니다. 사용자의 경우 user 패키지와 point 패키지로 나누어서 관련된 액티비티와 클래스들을 모아두었고, qr코드 인식을 위해 qrcodereaderview 라이브러리를 이용하였고, 모든 서버와 관련된 통신 라이브러리는 retrofit2를 사용했습니다. 카카오페이는 카카오페이 restapi를 이용해 테스트 id를 사용해 구현하였고, 테스트 결제 단계인 만큼 실제 결제가 이루어지지는 않게 되게 했습니다. 통신과 관련된 클래스와 인터페이스는 network 패키지에 모아두었고, 원래는 applicationcontroller 클래스에 Application()를 상속받아 사용하려 했으나 카카오 로그인에 쓰이는 GlobalApplication() 클래스를 구현하느라 통신 관련 url을 통신을 사용하는 액티비티에 전역변수로 선언을 해두어 사용했습니다. qr코드 사진을 보낼 때의 경우 다른 텍스트 정보와 다르게 함수에 mutlipart로 선언해서 사진 파일을 multipartbody로 만들어서 전송했습니다. 디자인 부분은 adobe xd로 스케치 한 뒤 안드로이드에 적용하는 방법 사용했습니다.

   #### 백엔드 파트
   ##### 서버 파트는 nodejs를 이용하여 express를 거쳐 아마존 AWS 서버를 사용해 구축하였습니다. mysql을 이용한 DB의 정보를 선별하여 클라이언트로 전달하는 것이 거의 작업의 전부였으며 서버의 도메인은 https로 따로 준비하지 못하였기 때문에 http로 http://15.165.205.48:8000 로 만들어 놓았습니다. (2020.07.19 이후 미작동)
   - (1) 라우터 : 
   usermode(사용자 모드) , hostmode(점주 모드), index(초기 유저 판별)로 유저의 character를 판별하고 그에 따른 action을 수행하게 구현하였습니다.
   
   - (2) DB 테이블 :
   creditlists(선결제 내역과 잔액을 확인하는 테이블) , hosts(점주의 정보와 지급된 QR코드를 저장) , receiptlists(점주와 선결제한 사용자간의 사용 내역을 저장하는 영수증 테이블), users (점주와 사용자 모두의 정보를 저장하는 테이블)
   레코드의 관리는 sequelize를 통해서 사용하였습니다.
  
  - (3) 이미지 :
  QR코드를 관리하기 위해 multer를 사용하고 클라이언트가 이를 불러올 때에는 DB에 host테이블에 저장된 QR의 저장 경로(url)을 이용하여 참조하게 하였습니다.

 ### 3. 사용 설명
초기 어플을 시작하면 가게를 방문하는 손님으로 로그인을 할지, 가게를 관리하는 점주(매니저)로 로그인을 할지 선택합니다. 로그인 버튼을 눌러서 카카오 API를 실행하여 카카오 로그인을 실행합니다.
 - 1) 손님으로 로그인 시
  * '선결제 하기' 버튼을 눌러서 점주(매니저)가 만든 QR코드를 스캔합니다. 스캔 후 선결제할 가격을 입력하고, 카카오 페이로 선결제를 진행합니다. 그러면 해당 가게에 선결제가 완료됩니다.
  * 선결제를 한 가게에서 '포인트 차감하기' 버튼을 눌러 QR코드를 다시 스캔 후 결제해야할 가격을 입력합니다. 그러면, 선결제했던 금액에서 해당 결제 금액만큼 차감됩니다. (반드시 기존에 선결제를 한 후 금액이 남아있는 가게에서만 포인트를 차감할 수 있습니다.)
  * '마이 페이지' 버튼을 누르면 손님이 선결제를 한 가게들의 이름과 남아있는 금액을 알려주는 리스트를 보여주게 됩니다. 이를 이용해서, 손님이 해당 가게에 선결제한 금액이 얼마나 남아있는지 알 수 있고, 선결제를 했던 가게들을 잊어도 기억할 수 있습니다.

 - 2) 점주(매니저)로 로그인 시
  * 해당 어플을 이용해서 가게 정보에 대한 QR코드를 발급받지 않은 점주는 가게 정보, 주소와 사장님의 한마디 등을 입력하여 QR코드를 발급합니다. 
  * 해당 QR코드를 '마이 페이지'에서 QR코드를 불러올 수 있고, 이를 손님들에게 보여주거나 인쇄를 해서 붙여두면 손님들이 선결제 및 포인트 사용을 할 수 있습니다.
  * '차감 확인' 버튼을 이용하여 가장 최근에 가게에서 포인트를 사용하여 계산한 손님을 볼 수 있습니다. 이를 이용해서 손님이 결제를 했는지 안했는지 확인할 수 있고, 해당 손님이 최근에 결제한 내역도 확인할 수 있습니다.
  * '선결제 POINT 내역' 버튼을 누르면 해당 가게에서 선결제를 한 손님들의 리스트를 볼 수 있고, 각 손님들의 선결제 잔액을 확인할 수 있습니다.

![임도훈_상장](https://user-images.githubusercontent.com/52443401/97078032-f2511a80-1623-11eb-9459-d6f0011526dd.png)
