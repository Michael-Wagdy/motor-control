#include "SPI.h"
#include "EmonLib.h"             // Include Emon Library
#define VOLT_CAL 860
//#define CURRENT_CAL 150
#define MAX6675_CS   10
#define MAX6675_SO   12
#define MAX6675_SCK  13
EnergyMonitor emon1;             // Create an instance
int IN1=7;
int IN2=9;
int y;
float Power=0;
void setup(){
  pinMode(IN1,OUTPUT);
  pinMode(IN2,OUTPUT);
  digitalWrite(IN1,LOW);
  digitalWrite(IN2,HIGH);
  Serial.begin(9600);
  emon1.voltage(A1, VOLT_CAL, 1.7);  // Voltage: input pin, calibration, phase_shift
   emon1.current(A8, 41.1);             // Current: input pin, calibration.
}


void loop(){  

  
  if (Serial.available())
  {
    y=Serial.read();
    if(y=='h')
    {
       digitalWrite(IN2,LOW);
  Serial.println("relay oon");
  }
    
 
 if(y=='l')
    {
    digitalWrite(IN2,HIGH);


  Serial.println("relay off");}}

emon1.calcVI(20,100);  // Calculate all. No.of half wavelengths (crossings), time-out
double Irms = emon1.calcIrms(1480);
delay(500);
    Serial.print(" Amps RMS:");
      //Serial.println(Irms*230.0);
      //Serial.println(" ");
      //if (Irms >0.10){
      Serial.print(Irms);  // Irms
//      }else {
//        Serial.print(0.00);
//        }


 // put your main code here, to run repeatedly:
  Serial.print(",temperature:");
  Serial.print(readThermocouple());

        

  float supplyVoltage   = emon1.Vrms;             //extract Vrms into Variable
  Serial.print(",INPUT V:");
    if (supplyVoltage >10){
  Serial.print(supplyVoltage);
      }else {
        Serial.print(0.00);}
         //float Power = emon1.realPower;

Power = supplyVoltage*Irms;
Serial.print(",Power:");
Serial.println(abs(Power));


}

double readThermocouple() {

  uint16_t v;
  pinMode(MAX6675_CS, OUTPUT);
  pinMode(MAX6675_SO, INPUT);
  pinMode(MAX6675_SCK, OUTPUT);
  
  digitalWrite(MAX6675_CS, LOW);
  delay(1);
v = shiftIn(MAX6675_SO, MAX6675_SCK, MSBFIRST);
  v <<= 8;
  v |= shiftIn(MAX6675_SO, MAX6675_SCK, MSBFIRST);
  
  digitalWrite(MAX6675_CS, HIGH);
  if (v & 0x4) 
  {    
    // Bit 2 indicates if the thermocouple is disconnected
    return NAN;     
  }

  // The lower three bits (0,1,2) are discarded status bits
  v >>= 3;

  // The remaining bits are the number of 0.25 degree (C) counts
  return v*0.25;
}

    
