import React, { Component } from 'react';
import Calendar from 'react-calendar';
import TimeRange from 'react-time-range';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import './App.css';

const moment = extendMoment(Moment);

function Appointments (props) {
  return (
    <div className="appointments">
      <h2>Appointments</h2>
      { props.appointments.map((appt, i) => 
          <p className="appointment" key={ i }>{ appt.displayString }
            <button className="appointment-btn" onClick={ () => props.delete(i) }>
              DELETE
            </button>
          </p>
        ) 
      }
    </div>);
}

class App extends Component {
  constructor(props) {
    super(props);

    let start = moment().startOf('hour').toISOString(),
    end = moment().startOf('hour').add(1, 'hours').toISOString();

    this.state = {
      appointments: [],
      startDate: '',
      minDate: new Date(),
      startTime: start,
      endTime: end,
      displayString: '',
      showErrors: false
    };
  }

  handleDateChange = (date) => {
    this.setState({ startDate: date });
  }

  handleStartTimeChange = (time) => {
    this.setState({ startTime: time.startTime });
  }

  handleEndTimeChange = (time) => {
    this.setState({ endTime: time.endTime });
  }

  scheduleAppointment = (display) => {
    this.setState({ showErrors: true });

    if (this.timeError() === ''){
      let list = this.state.appointments;
      list.push({ 
        date: moment(this.state.startDate).format('MM/DD/YYYY'), 
        startTime: moment(this.state.startTime).format('h:mm A'), 
        endTime: moment(this.state.endTime).format('h:mm A'),
        displayString: display
      });
      this.setState({ appointments: list });
      this.setState({ startDate: '' });
      this.setState({ showErrors: false });
    }
  }

  deleteAppointment = (index) => {
    let list = this.state.appointments;
    list.splice(index, 1);
    this.setState({ appointments: list });
  }

  canSchedule = () => {
    return this.state.startDate && this.state.startTime && this.state.endTime;
  }

  timeError = () => {
    let s = moment(this.state.startTime).format('h:mm A'),
    e = moment(this.state.endTime).format('h:mm A'),
    day = moment(this.state.startDate).format('MM/DD/YYYY'),
    sameDays = this.state.appointments.filter(appt => appt.date === day);

    if (s && e){
      if (s === e){
        return 'Please enter a valid time. Start time must be before end time.';
      }
      if (day && sameDays.length){
        let range = moment.range( moment(s, 'h:mm A'), moment(e, 'h:mm A')),
        invalid = ''
        sameDays.forEach(appt => {
          let testRange = moment.range( moment(appt.startTime, 'h:mm A'), moment(appt.endTime, 'h:mm A'));
          if (range.overlaps(testRange)){
            invalid = 'Please enter a valid time. Appointment already exists for ' + appt.displayString;
          }
        });
        return invalid;
      }
    }

    return '';
  }

  render() {

    let appointment = this.state.startDate ? moment(this.state.startDate).format('M/DD/YYYY') + '  ' : '';
    appointment += this.state.startTime ? moment(this.state.startTime).format('h:mm A') : '';
    appointment += this.state.endTime ? ' - ' + moment(this.state.endTime).format('h:mm A') : '';

    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Appointment Scheduler</h1>
        </header>

        <div className="container">
          <div className="calendar">

            <TimeRange 
              startMoment={ this.state.startTime }
              endMoment={ this.state.endTime }
              onStartTimeChange={ this.handleStartTimeChange }
              onEndTimeChange={ this.handleEndTimeChange }
              />

            <p className="time-error">{ this.state.showErrors ? this.timeError() : '' }</p>
            
            <Calendar
              onChange={ this.handleDateChange }
              value={ this.startDate }
              calendarType="US"
              minDate={ this.state.minDate }
              />

            <button 
              className="schedule-btn"
              onClick={ () => this.scheduleAppointment(appointment) } 
              disabled={ !this.canSchedule() } >
              SCHEDULE
            </button>

          </div>

          <Appointments 
            appointments={ this.state.appointments }
            delete={ this.deleteAppointment }
            />

        </div>

      </div>
    );
  }
}

export default App;
