import React from 'react';
import {StreamEntity} from '../../../Library/Type/StreamEntity';
import {ColorUtil} from '../../../Library/Util/ColorUtil';
import {Modal} from '../../../Library/View/Modal';
import {Text} from '../../../Library/View/Text';
import {TextInput} from '../../../Library/View/TextInput';
import {Icon} from '../../../Library/View/Icon';
import {space} from '../../../Library/Style/layout';
import {Link} from '../../../Library/View/Link';
import {colorPalette} from '../../../Library/Style/color';
import {View} from '../../../Library/View/View';
import {CheckBox} from '../../../Library/View/CheckBox';
import {Button} from '../../../Library/View/Button';
import styled from 'styled-components';
import {ClickView} from '../../../Library/View/ClickView';
import {StreamRepo} from '../../../Repository/StreamRepo';

type Props = {
  show: boolean;
  onClose: (edited: boolean, streamId?: number, childStreamId?: number) => void;
  editingCustomStream: StreamEntity;
  editingChildStream: StreamEntity | null;
}

type State = {
  name: string;
  filter: string;
  color: string;
  notification: boolean;
}

export class ChildStreamEditorFragment extends React.Component<Props, State> {
  state: State = {
    name: '',
    filter: '',
    color: '',
    notification: true,
  }

  componentDidUpdate(prevProps: Readonly<Props>, _prevState: Readonly<State>, _snapshot?: any) {
    // 表示されたときに初期化する
    if (!prevProps.show && this.props.show) {
      const editingChildStream = this.props.editingChildStream;
      if (editingChildStream) {
        this.setState({
          name: editingChildStream.name,
          filter: editingChildStream.userFilter,
          color: editingChildStream.color,
          notification: !!editingChildStream.notification,
        });
      } else {
        this.setState({
          name: '',
          filter: '',
          color: this.props.editingCustomStream.color,
          notification: !!this.props.editingCustomStream.notification,
        });
      }
    }
  }

  private async handleEdit() {
    const name = this.state.name?.trim();
    const filter = this.state.filter?.trim();
    const color = this.state.color?.trim();
    const notification = this.state.notification ? 1 : 0;

    if (!name) return;
    if (!filter.length) return;
    if (!ColorUtil.isValid(color)) return;

    if (this.props.editingChildStream) {
      const {error} = await StreamRepo.updateStream(this.props.editingChildStream.id, name, [], filter, notification, color, this.props.editingCustomStream.enabled);
      if (error) return console.error(error);
      this.props.onClose(true, this.props.editingCustomStream.id, this.props.editingChildStream.id);
    } else {
      const {error, stream} = await StreamRepo.createStream(this.props.editingCustomStream.id, name, [], filter, notification, color);
      if (error) return console.error(error);
      this.props.onClose(true, this.props.editingCustomStream.id, stream.id);
    }
  }

  private async handleCancel() {
    this.props.onClose(false);
  }

  render() {
    return (
      <Modal show={this.props.show} onClose={() => this.handleCancel()} style={{width: 500}}>
        {this.renderParentStream()}
        {this.renderName()}
        {this.renderFilter()}
        {this.renderColor()}
        {this.renderNotification()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private renderParentStream() {
    if (!this.props.editingCustomStream) return;

    const queries = this.props.editingCustomStream.queries;
    const queryViews = queries.map((query, index) => {
      return <TextInput value={query} onChange={() => null} key={index} readOnly={true} style={{marginBottom: space.small}}/>;
    });

    return (
      <React.Fragment>
        <Text>Stream: {this.props.editingCustomStream.name}</Text>
        {queryViews}
      </React.Fragment>
    );
  }

  private renderName() {
    return (
      <React.Fragment>
        <Space/>
        <Text>Name</Text>
        <TextInput value={this.state.name} onChange={t => this.setState({name: t})} placeholder='child stream name'/>
      </React.Fragment>
    );
  }

  private renderFilter() {
    return (
      <React.Fragment>
        <Space/>
        <Row>
          <Text>Query</Text>
          <Link url='https://jasperapp.io/doc.html#filter' style={{marginLeft: space.medium}}>help</Link>
        </Row>
        <TextInput
          value={this.state.filter}
          onChange={t => this.setState({filter: t})}
          placeholder='is:pr author:octocat'
        />
      </React.Fragment>
    );
  }

  private renderColor() {
    const colorViews = colorPalette.map((color, index) => {
      return (
        <ColorCell
          key={index}
          style={{background: color, marginLeft: space.small}}
          onClick={() => this.setState({color})}
        />
      );
    });

    return (
      <React.Fragment>
        <Space/>
        <Row>
          <Text>Color</Text>
          <Icon name='filter' color={this.state.color} style={{marginLeft: space.small}}/>
          <View style={{flex: 1}}/>
          {colorViews}
        </Row>
        <TextInput value={this.state.color} onChange={t => this.setState({color: t})}/>
      </React.Fragment>
    );
  }

  private renderNotification() {
    return (
      <React.Fragment>
        <Space/>
        <CheckBox
          checked={this.state.notification}
          onChange={c => this.setState({notification: c})}
          label='Notification'
        />
      </React.Fragment>
    );
  }

  private renderButtons() {
    return (
      <React.Fragment>
        <Space/>
        <Buttons>
          <View style={{flex: 1}}/>
          <Button onClick={() => this.handleCancel()}>Cancel</Button>
          <Button onClick={() => this.handleEdit()} type='primary' style={{marginLeft: space.medium}}>OK</Button>
        </Buttons>
      </React.Fragment>
    );
  }
}

const Space = styled(View)`
  height: ${space.large}px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Buttons = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const ColorCell = styled(ClickView)`
  width: 16px;
  height: 16px;
  border-radius: 100%;
`;