// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Container, Grid, Header, Icon, Segment, Divider } from 'semantic-ui-react';
import { QueryResult } from "@daml/react";
import { Party } from '@daml/types';
import { User, Work, Coin } from '@daml.js/proof-of-work';
import { publicContext, userContext } from './App';
import WorkRequestList from './WorkRequestList';
import NewWorkRequest from './NewWorkRequest';
import ResponseList from './ResponseList';
import PaymentList from './PaymentList';

type Props = {
  publicParty : Party;
}

const MainView: React.FC<Props> = ({publicParty}) => {
  const party = userContext.useParty();
  const myUser = userContext.useStreamFetchByKeys(User.User, () => [party], [party]);

  // This will retrieve all the work requests visible to the public
  const allRequests: QueryResult<Work.Request, unknown, string> = publicContext.useStreamQueries(Work.Request);

  // All the responses visible to me
  const allResponses: QueryResult<Work.Response, unknown, string> = userContext.useStreamQueries(Work.Response);

  // Get the available coins
  const myCoins: QueryResult<Coin.Coin, unknown, string> = userContext.useStreamQueries(Coin.Coin);
  const myCoinsContracts = myCoins.contracts;

  // Get the payment proposals visible to me (both issued by me and to me)
  const myTransferProposals: QueryResult<Coin.TransferProposal, unknown, string> = userContext.useStreamQueries(Coin.TransferProposal);

  const viewableRequestContracts = useMemo(() =>
    allRequests.contracts.filter(con => con.payload.status === "Active" || con.payload.sender === party),
    [allRequests, party]);

  const myResponses = useMemo(() =>
    allResponses.contracts.map(con => con.payload).filter(res => res.sender === party),
    [allResponses, party]);
  
  const myRequestResponseContracts = useMemo(() =>
    allResponses.contracts.filter(con => con.payload.requestKey._1 === party && con.payload.status !== "Cancelled"),
    [allResponses, party]);

  const myCoinContractIds = useMemo(() =>
    myCoins.contracts.map(con => con.contractId),
    [myCoins]);

  const myTransferProposalsContractsToAccept = useMemo(() =>
    myTransferProposals.contracts.filter(con => con.payload.newOwner === party),
    [myTransferProposals, party]);

  const name = myUser.loading ? 'loading ...' : myUser.contracts[0]?.payload.name ?? "loading...";
  const title = `Welcome ${name}`;
  const subTitle = `You have ${myCoinsContracts.length} coins in your wallet`;

  // console.log('--> My coins: ', myCoins);

  return (
    <Container>
      <Grid centered columns={1}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header as='h1' size='huge' color='blue' textAlign='center' style={{padding: '1ex 0em 0ex 0em'}}>
                {title}
                <Header.Subheader>{subTitle}</Header.Subheader>
            </Header>
            <Segment>
              <Header as='h2'>
                <Icon name='list' />
                <Header.Content>
                  Work Requests
                  <Header.Subheader>Only active, or created by you (<Icon color='teal' name='home' />)</Header.Subheader>
                </Header.Content>
              </Header>
              <Divider />
              <NewWorkRequest
                publicParty={publicParty}
                coinContractIds={myCoinContractIds}
              />
              <Divider />
              <WorkRequestList
                requestContracts={viewableRequestContracts}
                coinContractIds={myCoinContractIds}
                responseContracts={myRequestResponseContracts}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>
        {myResponses.length > 0 && 
          <Grid.Row stretched>
            <Grid.Column>
              <Segment>
                <Header as='h2'>
                  <Icon name='tasks' />
                  <Header.Content>
                    My Responses
                    <Header.Subheader>Across all the requests</Header.Subheader>
                  </Header.Content>
                </Header>
                <Divider />
                <ResponseList
                  responses={myResponses}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        }
        {myTransferProposalsContractsToAccept.length > 0 && 
          <Grid.Row stretched>
            <Grid.Column>
              <Segment>
                <Header as='h2'>
                  <Icon name='bitcoin' />
                  <Header.Content>
                    Pending Payments
                  </Header.Content>
                </Header>
                <Divider />
                <PaymentList
                  transferProposalContracts={myTransferProposalsContractsToAccept}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        }
      </Grid>
    </Container>
  );
}

export default MainView;
